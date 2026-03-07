import type { FastifyPluginAsync } from "fastify";
import { randomUUID } from "node:crypto";
import type { Runtime } from "@murmur/core";
import type { WorkflowRunResult } from "@murmur/agents-core";

interface WorkflowRunBody {
  workflowId: string;
  goal: string;
  input: Record<string, unknown>;
}

interface WorkflowNotFoundReply {
  message: string;
}

const workflowRunBodySchema = {
  type: "object",
  required: ["workflowId", "goal", "input"],
  properties: {
    workflowId: { type: "string", minLength: 1 },
    goal: { type: "string", minLength: 1 },
    input: { type: "object", additionalProperties: true }
  },
  additionalProperties: false
} as const;

export const workflowRoutes: FastifyPluginAsync<{ runtime: Runtime }> = async (
  app,
  { runtime }
) => {
  app.post<{
    Body: WorkflowRunBody;
    Reply: WorkflowRunResult | WorkflowNotFoundReply;
  }>(
    "/workflows/run",
    { schema: { body: workflowRunBodySchema } },
    async (request, reply) => {
      const { workflowId, goal, input } = request.body;
      try {
        runtime.workflowRegistry.get(workflowId);
      } catch {
        return reply.code(404).send({
          message: `Workflow not found: ${workflowId}`
        });
      }

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
