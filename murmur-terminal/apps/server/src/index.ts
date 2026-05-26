import { createServer } from "http";
import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import { WebSocketServer } from "ws";
import jwt, { JwtPayload } from "jsonwebtoken";
import { mkdirSync, createWriteStream } from "fs";
import path from "path";

const PORT = Number(process.env.PORT || 8080);
const IDLE_TIMEOUT_MS = 30 * 60 * 1000;
const isProd = process.env.NODE_ENV === "production";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

const JWT_SECRET = isProd ? requireEnv("JWT_SECRET") : (process.env.JWT_SECRET || "dev-secret-change-me");
const auditPath = process.env.AUDIT_LOG_PATH || "./logs/gateway-audit.log";
mkdirSync(path.dirname(auditPath), { recursive: true });
const auditStream = createWriteStream(auditPath, { flags: "a", encoding: "utf-8" });

const permissionMatrix: Record<string, string[]> = {
  operator: ["session:spawn:operator"],
  architect: ["session:spawn:admin"],
  a7: ["session:spawn:admin"]
};

type AuthPayload = JwtPayload & {
  sub: string;
  role: "operator" | "architect" | "a7";
};

const httpServer = createServer();
const wss = new WebSocketServer({ server: httpServer });

function audit(event: string, data: Record<string, unknown> = {}) {
  const line = JSON.stringify({ ts: new Date().toISOString(), event, ...data });
  console.log(line);
  auditStream.write(`${line}\n`);
}

process.on("SIGINT", () => {
  auditStream.end();
  process.exit(0);
});

process.on("SIGTERM", () => {
  auditStream.end();
  process.exit(0);
});

function getToken(req: { headers: Record<string, unknown>; url?: string }): string | null {
  const auth = req.headers["authorization"];
  if (typeof auth === "string" && auth.startsWith("Bearer ")) {
    return auth.slice(7);
  }

  if (!isProd && req.url) {
    const url = new URL(req.url, "http://localhost");
    const queryToken = url.searchParams.get("token");
    if (queryToken) return queryToken;
  }

  return null;
}

wss.on("connection", (ws, req) => {
  const token = getToken(req as any);
  if (!token) {
    ws.close(4001, "Missing token");
    return;
  }

  let payload: AuthPayload;
  try {
    payload = jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch {
    ws.close(4002, "Invalid token");
    return;
  }

  const userId = payload.sub;
  const role = payload.role;
  const perms = new Set(permissionMatrix[role] || []);
  if (!userId || !role || perms.size === 0) {
    ws.close(4003, "Forbidden role");
    return;
  }

  const shellCommand = perms.has("session:spawn:admin") ? "bash" : "murmur";
  const containerName = `murmur-session-${userId}-${Date.now()}`;

  audit("ws_connection_accepted", { userId, role, shellCommand, remote: req.socket.remoteAddress || null });

  const dockerRun = spawn("docker", [
    "run",
    "-d",
    "--name",
    containerName,
    "--read-only",
    "--tmpfs",
    "/tmp:rw,noexec,nosuid,size=64m",
    "--cap-drop=ALL",
    "--security-opt",
    "no-new-privileges:true",
    "--pids-limit",
    "128",
    "--memory",
    "512m",
    "--cpus",
    "1",
    "murmur-session",
    "sleep",
    "infinity"
  ]);

  let containerRunOutput = "";
  dockerRun.stdout.on("data", (d) => {
    containerRunOutput += d.toString();
  });

  dockerRun.stderr.on("data", (d) => {
    audit("session_container_start_error", { userId, role, containerName, stderr: d.toString() });
  });

  dockerRun.on("close", (code) => {
    if (code !== 0) {
      ws.send("Failed to start session container\r\n");
      ws.close(1011, "container start failed");
      return;
    }

    const containerId = containerRunOutput.trim();
    audit("session_started", { userId, role, containerName, containerId });

    const pty: ChildProcessWithoutNullStreams = spawn("docker", ["exec", "-i", containerName, shellCommand], {
      stdio: "pipe"
    });

    let idleTimer: NodeJS.Timeout;
    const resetIdle = () => {
      clearTimeout(idleTimer);
      idleTimer = setTimeout(() => {
        ws.send("\r\nIdle timeout reached. Closing session.\r\n");
        ws.close(1000, "idle timeout");
      }, IDLE_TIMEOUT_MS);
    };

    resetIdle();

    pty.stdout.on("data", (data) => ws.send(data.toString()));
    pty.stderr.on("data", (data) => ws.send(data.toString()));
    pty.on("close", () => ws.close(1000, "session ended"));

    ws.on("message", (message) => {
      resetIdle();
      pty.stdin.write(message.toString());
    });

    let cleaned = false;
    const cleanup = () => {
      if (cleaned) return;
      cleaned = true;
      clearTimeout(idleTimer);
      pty.kill();
      spawn("docker", ["rm", "-f", containerName]);
      audit("session_closed", { userId, role, containerName });
    };

    ws.on("close", cleanup);
    ws.on("error", cleanup);
  });
});

httpServer.listen(PORT, "0.0.0.0", () => {
  audit("gateway_started", { port: PORT, isProd, auditPath });
});
