import type {
  FastifyPluginAsync,
  FastifyReply,
  FastifyRequest
} from "fastify";
import { randomUUID } from "node:crypto";
import type { Runtime } from "@murmur/core";
import type { WorkflowRunResult } from "@murmur/agents-core";

interface WorkflowRunBody {
  workflowId: string;
  goal: string;
  input: Record<string, unknown>;
}

export const workflowRoutes: FastifyPluginAsync<{ runtime: Runtime }> = async (
  app,
  { runtime }
) => {
  app.post<{ Body: WorkflowRunBody; Reply: WorkflowRunResult }>(
    "/workflows/run",
    async (
      request: FastifyRequest & { body: WorkflowRunBody },
      reply: FastifyReply
    ) => {
      const { workflowId, goal, input } = request.body;
      runtime.workflowRegistry.get(workflowId);

      const runResult = await runtime.workflowRunner.run({
        workflowId,
        runId: randomUUID(),
        goal,
        input
      });

      return reply.send(runResult);
    }
  );
};
