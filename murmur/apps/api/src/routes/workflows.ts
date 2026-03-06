import { randomUUID } from "node:crypto";
import { bootstrapRuntime } from "@murmur/orchestration";

export type CreateWorkflowRunBody = {
  workflowId?: string;
  goal?: string;
  projectId?: string;
  input?: Record<string, unknown>;
};

const runtime = bootstrapRuntime();

export async function listWorkflows(): Promise<{ workflows: unknown[] }> {
  return {
    workflows: runtime.workflowRegistry.list(),
  };
}

export async function runWorkflow(
  body: CreateWorkflowRunBody,
): Promise<{ statusCode: number; payload: unknown }> {
  const workflowId = body.workflowId ?? "murmur-core";
  const goal = body.goal ?? "Run MurMur core workflow";
  const input = body.input ?? {};
  const runId = randomUUID();

  const result = await runtime.workflowRunner.run({
    workflowId,
    runId,
    projectId: body.projectId,
    goal,
    input,
  });

  return {
    statusCode: 201,
    payload: result,
  };
}
