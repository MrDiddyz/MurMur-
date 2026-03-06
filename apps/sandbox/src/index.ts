import Fastify from "fastify";
import { z } from "zod";

const app = Fastify({ logger: true });
app.get("/health", async () => ({ ok: true }));
app.post("/execute", async (req, reply) => {
  const parsed = z.object({ language: z.literal("typescript"), code: z.string() }).safeParse(req.body);
  if (!parsed.success) return reply.status(400).send({ error: parsed.error.flatten() });

  // TODO: Replace with secure isolated runtime (container/VM) in production.
  return { stdout: `Mock execution received ${parsed.data.code.length} chars`, stderr: "", exitCode: 0 };
});

app.listen({ port: 4004, host: "0.0.0.0" });
