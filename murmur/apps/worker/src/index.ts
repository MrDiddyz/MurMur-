import { bootstrapRuntime } from "@murmur/core";
import type { WorkflowRunPayload } from "@murmur/agents-core";

const runtime = bootstrapRuntime();

export async function processWorkflowJob(payload: WorkflowRunPayload) {
  runtime.workflowRegistry.get(payload.workflowId);
  return runtime.workflowRunner.run(payload);
}

async function main(): Promise<void> {
  const samplePayload: WorkflowRunPayload = {
    workflowId: "murmur",
    runId: `worker-${Date.now()}`,
    goal: "Demonstrate asynchronous workflow processing",
    input: { source: "worker-startup" }
  };

  const result = await processWorkflowJob(samplePayload);
  console.log(JSON.stringify(result, null, 2));
}

if (process.env.WORKER_RUN_ON_START === "true") {
  main().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}
