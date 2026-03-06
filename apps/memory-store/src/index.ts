import Fastify from "fastify";
import { z } from "zod";
import { memoryRepository } from "@murmur/db";

const app = Fastify({ logger: true });

app.post("/memories", async (request, reply) => {
  const body = z
    .object({
      workflowId: z.string(),
      content: z.string().min(1),
      tags: z.array(z.string()).optional(),
      metadata: z.record(z.string(), z.unknown()).optional()
    })
    .parse(request.body);
  const memory = await memoryRepository.createMemory(body);
  return reply.code(201).send(memory);
});

app.get("/memories/search", async (request) => {
  const { q } = z.object({ q: z.string().min(1) }).parse(request.query);
  return memoryRepository.searchMemories(q);
});

app.get("/memories/:workflowId", async (request) => {
  const { workflowId } = z.object({ workflowId: z.string() }).parse(request.params);
  return memoryRepository.getByWorkflowId(workflowId);
});

app.get("/health", async () => ({ ok: true }));

const port = Number(process.env.MEMORY_STORE_PORT ?? 4004);
app
  .listen({ port, host: "0.0.0.0" })
  .catch((error) => {
    app.log.error(error);
    process.exit(1);
  });
