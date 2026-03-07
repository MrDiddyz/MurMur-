import type { FastifyPluginAsync } from "fastify";
import type { Runtime } from "@murmur/core";

export const runRoutes: FastifyPluginAsync<{ runtime: Runtime }> = async (app, { runtime }) => {
  app.get("/runs/:runId", async (request: { params: { runId: string } }, reply: { code: (v:number)=>{send:(p:unknown)=>unknown} }) => {
    const run = await runtime.workflowRunner.getRun(request.params.runId);
    if (!run) return reply.code(404).send({ message: "run not found" });
    return run;
  });
};
