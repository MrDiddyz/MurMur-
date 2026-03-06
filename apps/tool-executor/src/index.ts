import Fastify from "fastify";
import { z } from "zod";
import { env } from "@murmur/shared";

const app = Fastify({ logger: true });

app.addHook("onRequest", async (req, reply) => {
  if (req.headers["x-internal-api-key"] !== env.internalApiKey) {
    return reply.status(401).send({ error: "unauthorized" });
  }
});

app.get("/health", async () => ({ ok: true }));
app.post("/tools/web-search", async req => {
  const q = z.object({ query: z.string() }).parse(req.body);
  return { query: q.query, results: [{ title: "Mock Result", snippet: `Search result for ${q.query}` }] };
});
app.post("/tools/fetch-url", async req => {
  const q = z.object({ url: z.string().url() }).parse(req.body);
  return { url: q.url, status: 200, body: "Mock HTML content" };
});
app.post("/tools/extract-text", async req => {
  const q = z.object({ html: z.string() }).parse(req.body);
  return { text: q.html.replace(/<[^>]+>/g, " ").trim() };
});

app.listen({ port: 4003, host: "0.0.0.0" });
