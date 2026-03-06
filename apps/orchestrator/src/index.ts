import Fastify from "fastify";
import { runWorkflowGraph } from "@murmur/graph";
import { RunWorkflowRequestSchema } from "@murmur/shared";

const app = Fastify({ logger: true });
app.get("/health", async () => ({ ok: true }));

app.post("/run-workflow", async (request, reply) => {
  const parsed = RunWorkflowRequestSchema.safeParse(request.body);
  if (!parsed.success) return reply.status(400).send({ error: parsed.error.flatten() });
  const result = await runWorkflowGraph(parsed.data);
  return result;
});

app.listen({ port: 4002, host: "0.0.0.0" });
