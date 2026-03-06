import Fastify from "fastify";
import { z } from "zod";
import { createMemory, getMemoriesByWorkflowId, searchMemories } from "@murmur/db";

const app = Fastify({ logger: true });

app.get("/health", async () => ({ ok: true }));
app.post("/memories", async req => {
  const body = z.object({ workflowId: z.string(), content: z.string(), tags: z.array(z.string()).optional() }).parse(req.body);
  const memory = await createMemory(body);
  return { memory };
});
app.get("/memories/:workflowId", async req => {
  const workflowId = (req.params as { workflowId: string }).workflowId;
  const memories = await getMemoriesByWorkflowId(workflowId);
  return { memories };
});
app.get("/memories/search", async req => {
  const q = z.string().min(1).parse((req.query as { q?: string }).q);
  // TODO: swap to vector index service later.
  const memories = await searchMemories(q);
  return { memories };
});

app.listen({ port: 4005, host: "0.0.0.0" });
