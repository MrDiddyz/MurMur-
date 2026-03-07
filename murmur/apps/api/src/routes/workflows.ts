import type { FastifyPluginAsync } from "fastify";
import { randomUUID } from "node:crypto";
import type { Runtime } from "@murmur/core";

interface RunBody {
  workflowId: string;
  objective: string;
  input: Record<string, unknown>;
  projectId?: string;
}

export const workflowRoutes: FastifyPluginAsync<{ runtime: Runtime }> = async (app, { runtime }) => {
  app.get("/workflows", async () => ({ workflows: runtime.workflowRegistry.list() }));

  app.post("/workflows/run", async (request: { body: RunBody }) => {
    const runId = randomUUID();
    return runtime.workflowRunner.run({
      workflowId: request.body.workflowId,
      runId,
      objective: request.body.objective,
      input: request.body.input,
      projectId: request.body.projectId
    });
  });
};
