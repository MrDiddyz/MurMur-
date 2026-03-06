import { createServer, type IncomingMessage, type ServerResponse } from "node:http";
import { listWorkflows, runWorkflow, type CreateWorkflowRunBody } from "./routes/workflows";

const host = process.env.HOST ?? "0.0.0.0";
const port = Number(process.env.PORT ?? 3001);

async function readJsonBody(request: IncomingMessage): Promise<Record<string, unknown>> {
  const chunks: Buffer[] = [];

  for await (const chunk of request) {
    chunks.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
  }

  if (chunks.length === 0) {
    return {};
  }

  const text = Buffer.concat(chunks).toString("utf8").trim();

  if (!text) {
    return {};
  }

  const parsed = JSON.parse(text) as unknown;

  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error("Request body must be a JSON object");
  }

  return parsed as Record<string, unknown>;
}

function sendJson(reply: ServerResponse, statusCode: number, payload: unknown): void {
  const body = JSON.stringify(payload);
  reply.writeHead(statusCode, {
    "content-type": "application/json; charset=utf-8",
    "content-length": Buffer.byteLength(body),
  });
  reply.end(body);
}

async function requestHandler(request: IncomingMessage, reply: ServerResponse): Promise<void> {
  const method = request.method ?? "GET";
  const path = request.url?.split("?")[0] ?? "/";

  try {
    if (method === "GET" && path === "/workflows") {
      const payload = await listWorkflows();
      sendJson(reply, 200, payload);
      return;
    }

    if (method === "POST" && path === "/workflows/run") {
      const body = (await readJsonBody(request)) as CreateWorkflowRunBody;
      const result = await runWorkflow(body);
      sendJson(reply, result.statusCode, result.payload);
      return;
    }

    sendJson(reply, 404, {
      error: "Not Found",
      message: `No route for ${method} ${path}`,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unexpected error";
    sendJson(reply, 400, {
      error: "Bad Request",
      message,
    });
  }
}

function main(): void {
  const server = createServer((request, reply) => {
    void requestHandler(request, reply);
  });

  server.listen(port, host, () => {
    console.log(`[api] listening on http://${host}:${port}`);
  });
}

main();
