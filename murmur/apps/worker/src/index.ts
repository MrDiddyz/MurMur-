import { randomUUID } from "node:crypto";
import { processWorkflowJob } from "./processors/workflow-processor";

async function main(): Promise<void> {
  const result = await processWorkflowJob({
    workflowId: "murmur-core",
    runId: randomUUID(),
    goal: "Generate a first MurMur multi-agent reasoning pass",
    input: {
      objective: "Build a reflective multi-agent scaffold",
      constraints: ["TypeScript-first", "modular", "readable"],
    },
  });

  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
