import { bootstrapRuntime } from "@murmur/core";
import type { WorkflowRunInput } from "@murmur/agents-core";

const runtime = bootstrapRuntime();

export async function processWorkflowJob(payload: WorkflowRunInput) {
  const result = await runtime.workflowRunner.run(payload);
  console.log(`[worker] run=${result.runId} workflow=${result.workflowId} status=${result.status}`);
  return result;
}
