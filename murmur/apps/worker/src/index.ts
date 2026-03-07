import { randomUUID } from "node:crypto";
import type { WorkflowRunInput } from "@murmur/agents-core";
import { processWorkflowJob } from "./processors/workflow-processor.js";

async function main(): Promise<void> {
  const samplePayload: WorkflowRunInput = {
    workflowId: "murmur-core-v2",
    runId: randomUUID(),
    objective: "Design a safer iterative rollout strategy for murmur v2",
    input: {
      domain: "agent orchestration",
      constraints: ["deterministic", "traceable", "typed"]
    }
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

export { processWorkflowJob };
