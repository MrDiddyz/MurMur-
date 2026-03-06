import { bootstrapRuntime } from "@murmur/orchestration";

export type WorkflowJobPayload = {
  workflowId: string;
  runId: string;
  projectId?: string;
  goal: string;
  input: Record<string, unknown>;
};

const runtime = bootstrapRuntime();

export async function processWorkflowJob(
  payload: WorkflowJobPayload,
): Promise<unknown> {
  const result = await runtime.workflowRunner.run(payload);

  console.log("[worker] workflow completed", {
    runId: result.runId,
    workflowId: result.workflowId,
    steps: result.steps.map((step) => step.step),
  });

  return result;
}
