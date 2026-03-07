import type { FastifyPluginAsync } from "fastify";
import type { Runtime } from "@murmur/core";

export const memoryRoutes: FastifyPluginAsync<{ runtime: Runtime }> = async (app, { runtime }) => {
  app.get("/memory", async (request: { query: { objective?: string; workflowId?: string; tags?: string; limit?: string } }) => {
    return runtime.memoryStore.search({
      objective: request.query.objective,
      workflowId: request.query.workflowId,
      tags: request.query.tags ? request.query.tags.split(",") : undefined,
      limit: request.query.limit ? Number(request.query.limit) : 20
    });
  });
};
