import Fastify from "fastify";
import { z } from "zod";
import { appendWorkflowEvent, createWorkflow, getWorkflowById, listWorkflowCheckpoints, listWorkflowEvents, updateWorkflowStatus } from "@murmur/db";
import { enqueueWorkflowRun } from "@murmur/queue";
import { CreateWorkflowSchema, env } from "@murmur/shared";

const app = Fastify({ logger: true });

app.get("/health", async () => ({ ok: true }));

app.post("/workflows", async (request, reply) => {
  const parsed = CreateWorkflowSchema.safeParse(request.body);
  if (!parsed.success) return reply.status(400).send({ error: parsed.error.flatten() });
  const workflow = await createWorkflow(parsed.data);
  await appendWorkflowEvent({ workflowId: workflow.id, type: "workflow", message: "Workflow created" });
  await enqueueWorkflowRun({ workflowId: workflow.id });
  return reply.status(201).send({ workflowId: workflow.id, status: workflow.status });
});

app.get("/workflows/:id", async (request, reply) => {
  const id = z.string().parse((request.params as { id: string }).id);
  const workflow = await getWorkflowById(id);
  if (!workflow) return reply.status(404).send({ error: "Not found" });
  const checkpoints = await listWorkflowCheckpoints(id);
  return { ...workflow, checkpoints };
});

app.get("/workflows/:id/events", async request => {
  const id = z.string().parse((request.params as { id: string }).id);
  const events = await listWorkflowEvents(id);
  return { events };
});

app.post("/workflows/:id/cancel", async (request, reply) => {
  const id = z.string().parse((request.params as { id: string }).id);
  await updateWorkflowStatus(id, "cancelled");
  await appendWorkflowEvent({ workflowId: id, type: "workflow", message: "Workflow cancelled" });
  return reply.send({ workflowId: id, status: "cancelled" });
});

app.listen({ port: env.apiPort, host: "0.0.0.0" });
