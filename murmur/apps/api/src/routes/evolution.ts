import type { FastifyPluginAsync } from "fastify";
import type { Runtime } from "@murmur/core";

export const evolutionRoutes: FastifyPluginAsync<{ runtime: Runtime }> = async (app, { runtime }) => {
  app.get("/evolution/proposals", async () => {
    const runs = await runtime.workflowRunner.listRuns(30);
    const proposals = runs.flatMap((run) => run.evolution ?? []);
    return { proposals };
  });

  app.post("/evolution/proposals/:id/apply", async (request: { params: { id: string } }) => ({
    id: request.params.id,
    status: "manual review required"
  }));
};
