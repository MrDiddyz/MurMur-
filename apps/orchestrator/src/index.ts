import Fastify from "fastify";
import { z } from "zod";
import { runWorkflowGraph } from "@murmur/graph";

const app = Fastify({ logger: true });

app.post("/run", async (request, reply) => {
  const body = z
    .object({
      workflowId: z.string(),
      prompt: z.string(),
      checkpointsUrl: z.string().url().optional()
    })
    .parse(request.body);

  const state = await runWorkflowGraph(
    { workflowId: body.workflowId, prompt: body.prompt },
    async (node, snapshot) => {
      if (!body.checkpointsUrl) {
        return;
      }

      const checkpointResponse = await fetch(body.checkpointsUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workflowId: body.workflowId, node, state: snapshot })
      });

      if (!checkpointResponse.ok) {
        request.log.warn({ node, workflowId: body.workflowId }, "Checkpoint endpoint rejected update");
      }
    }
  );

  return reply.send({ workflowId: body.workflowId, state });
});

app.get("/health", async () => ({ ok: true }));

const port = Number(process.env.ORCHESTRATOR_PORT ?? 4001);
app
  .listen({ port, host: "0.0.0.0" })
  .catch((error) => {
    app.log.error(error);
    process.exit(1);
  });
