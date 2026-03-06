import Fastify from "fastify";
import cors from "@fastify/cors";
import { ZodError, z } from "zod";
import { CreateWorkflowInputSchema } from "@murmur/shared";
import { workflowRepository } from "@murmur/db";
import { enqueueWorkflowJob } from "@murmur/queue";

const app = Fastify({ logger: true });

await app.register(cors, {
  origin: true
});

app.setErrorHandler((error, _request, reply) => {
  if (error instanceof ZodError) {
    return reply.code(400).send({ message: "Validation error", issues: error.issues });
  }

  app.log.error(error);
  return reply.code(500).send({ message: "Internal server error" });
});

app.post("/workflows", async (request, reply) => {
  const body = CreateWorkflowInputSchema.parse(request.body);
  const workflow = await workflowRepository.createWorkflow(body);
  await workflowRepository.appendEvent({
    workflowId: workflow.id,
    type: "workflow.created",
    message: "Workflow created and queued"
  });
  await enqueueWorkflowJob({ workflowId: workflow.id });
  return reply.code(201).send(workflow);
});

app.get("/workflows/:id", async (request, reply) => {
  const { id } = z.object({ id: z.string() }).parse(request.params);
  const workflow = await workflowRepository.getWorkflow(id);
  if (!workflow) {
    return reply.code(404).send({ message: "Not found" });
  }
  return workflow;
});

app.get("/workflows/:id/events", async (request) => {
  const { id } = z.object({ id: z.string() }).parse(request.params);
  return workflowRepository.listEvents(id);
});

app.post("/workflows/:id/checkpoints", async (request, reply) => {
  const { id } = z.object({ id: z.string() }).parse(request.params);
  const body = z
    .object({
      node: z.string().min(1),
      state: z.unknown()
    })
    .parse(request.body);

  await workflowRepository.saveCheckpoint({
    workflowId: id,
    node: body.node,
    state: body.state
  });

  await workflowRepository.appendEvent({
    workflowId: id,
    type: "workflow.checkpoint",
    message: `Checkpoint saved for node ${body.node}`,
    payload: { node: body.node }
  });

  return reply.code(201).send({ ok: true });
});

app.post("/workflows/:id/cancel", async (request, reply) => {
  const { id } = z.object({ id: z.string() }).parse(request.params);
  await workflowRepository.updateStatus(id, "cancelled");
  await workflowRepository.appendEvent({
    workflowId: id,
    type: "workflow.cancelled",
    message: "Workflow marked as cancelled"
  });
  return reply.send({ id, status: "cancelled" });
});

app.get("/health", async () => ({ ok: true }));

const port = Number(process.env.API_PORT ?? 4000);
app
  .listen({ port, host: "0.0.0.0" })
  .catch((error) => {
    app.log.error(error);
    process.exit(1);
  });
