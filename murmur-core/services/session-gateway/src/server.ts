import { createServer } from "node:http";
import { WebSocketServer } from "ws";
import { spawnDockerSession, type Session as RuntimeSession } from "./dockerSession.js";
import { can, resolveAuthContext, type AuthContext } from "./authz.js";
import { getPrisma } from "./db.js";

const port = Number(process.env.PORT ?? 8787);
const server = createServer((_, res) => {
  res.writeHead(200, { "content-type": "application/json" });
  res.end(JSON.stringify({ status: "ok" }));
});

const wss = new WebSocketServer({ noServer: true });

server.on("upgrade", (request, socket, head) => {
  const requestUrl = new URL(request.url ?? "/ws", "http://localhost");
  if (requestUrl.pathname !== "/ws") {
    socket.destroy();
    return;
  }

  wss.handleUpgrade(request, socket, head, (ws) => {
    wss.emit("connection", ws, request);
  });
});

wss.on("connection", async (ws, request) => {
  const requestUrl = new URL(request.url ?? "/ws", "http://localhost");
  const emailFromQuery = requestUrl.searchParams.get("email") ?? undefined;
  const context: AuthContext | null = await resolveAuthContext(emailFromQuery);
  let runtimeSession: RuntimeSession | null = null;
  let dbSessionId: string | null = null;

  if (!context) {
    ws.send(JSON.stringify({ type: "error", message: "Unauthorized: missing/unknown email query param" }));
    ws.close();
    return;
  }

  ws.send(JSON.stringify({ type: "ready", message: `connected as ${context.user.email}` }));

  ws.on("message", async (raw) => {
    try {
      const message = JSON.parse(raw.toString()) as {
        type: "start_session" | "stdin" | "stop";
        image?: string;
        command?: string[];
        data?: string;
      };

      if (message.type === "start_session") {
        if (!can(context, "session.start")) {
          ws.send(JSON.stringify({ type: "error", message: "RBAC: missing session.start" }));
          return;
        }

        runtimeSession = spawnDockerSession(message.image ?? "alpine:3.20", message.command ?? ["sh"]);
        const dbSession = await getPrisma().session.create({
          data: {
            userId: context.user.id,
            container: runtimeSession.id
          }
        });
        dbSessionId = dbSession.id;

        runtimeSession.process.stdout.on("data", (chunk) => ws.send(JSON.stringify({ type: "stdout", chunk: chunk.toString() })));
        runtimeSession.process.stderr.on("data", (chunk) => ws.send(JSON.stringify({ type: "stderr", chunk: chunk.toString() })));
        runtimeSession.process.on("exit", (code) => ws.send(JSON.stringify({ type: "exit", code })));
        ws.send(JSON.stringify({ type: "session_started", sessionId: runtimeSession.id, dbSessionId }));
        return;
      }

      if (message.type === "stdin") {
        if (!can(context, "session.stdin")) {
          ws.send(JSON.stringify({ type: "error", message: "RBAC: missing session.stdin" }));
          return;
        }
        if (!runtimeSession) {
          ws.send(JSON.stringify({ type: "error", message: "No active session" }));
          return;
        }
        runtimeSession.process.stdin.write(message.data ?? "");
        return;
      }

      if (message.type === "stop") {
        if (!can(context, "session.stop")) {
          ws.send(JSON.stringify({ type: "error", message: "RBAC: missing session.stop" }));
          return;
        }
        runtimeSession?.process.kill("SIGTERM");
      }
    } catch {
      ws.send(JSON.stringify({ type: "error", message: "Invalid message payload" }));
    }
  });

  ws.on("close", async () => {
    runtimeSession?.process.kill("SIGTERM");
    if (dbSessionId) {
      await getPrisma().session.delete({ where: { id: dbSessionId } }).catch(() => null);
    }
  });
});

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`session-gateway listening on :${port}`);
});
