import Fastify from "fastify";
import { z } from "zod";

const app = Fastify({ logger: true });
const apiKey = process.env.INTERNAL_API_KEY ?? "dev-internal-key";

app.addHook("onRequest", async (request, reply) => {
  if (request.headers["x-internal-api-key"] !== apiKey) {
    return reply.code(401).send({ message: "Unauthorized" });
  }
});

app.post("/tools/web_search", async (request) => {
  const { query } = z.object({ query: z.string().min(1) }).parse(request.body);
  return { tool: "web_search", query, results: [{ title: "Mock result", url: "https://example.com" }] };
});

app.post("/tools/fetch_url", async (request) => {
  const { url } = z.object({ url: z.string().url() }).parse(request.body);
  return { tool: "fetch_url", url, status: 200, content: "Mock fetched content" };
});

app.post("/tools/extract_text", async (request) => {
  const { input } = z.object({ input: z.string() }).parse(request.body);
  return { tool: "extract_text", text: input.replace(/<[^>]+>/g, " ").trim() };
});

app.get("/health", async () => ({ ok: true }));

const port = Number(process.env.TOOL_EXECUTOR_PORT ?? 4002);
app
  .listen({ port, host: "0.0.0.0" })
  .catch((error) => {
    app.log.error(error);
    process.exit(1);
  });
