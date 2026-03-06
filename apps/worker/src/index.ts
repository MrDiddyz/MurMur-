import { createWorkflowWorker } from "@murmur/queue";
import { workflowRepository } from "@murmur/db";

const orchestratorUrl = process.env.ORCHESTRATOR_URL ?? "http://localhost:4001";
const apiInternalUrl = process.env.API_INTERNAL_URL ?? "http://api:4000";

const worker = createWorkflowWorker(async (job) => {
  const { workflowId } = job.data;
  const workflow = await workflowRepository.getWorkflow(workflowId);
  if (!workflow) {
    throw new Error(`Workflow ${workflowId} missing`);
  }

  if (workflow.status === "cancelled") {
    await workflowRepository.appendEvent({
      workflowId,
      type: "workflow.skipped",
      message: "Workflow was already cancelled before execution"
    });
    return;
  }

  await workflowRepository.updateStatus(workflowId, "running", null);
  await workflowRepository.appendEvent({
    workflowId,
    type: "workflow.started",
    message: "Worker started execution"
  });

  try {
    const response = await fetch(`${orchestratorUrl}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        workflowId,
        prompt: workflow.prompt,
        checkpointsUrl: `${apiInternalUrl}/workflows/${workflowId}/checkpoints`
      })
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Orchestrator failed: ${response.status} ${body}`);
    }

    const payload = (await response.json()) as { state: unknown };
    await workflowRepository.saveResult(workflowId, payload.state);
    await workflowRepository.appendEvent({
      workflowId,
      type: "workflow.completed",
      message: "Workflow completed successfully",
      payload: payload.state
    });
  } catch (error) {
    await workflowRepository.updateStatus(workflowId, "failed", (error as Error).message);
    await workflowRepository.appendEvent({
      workflowId,
      type: "workflow.failed",
      message: "Workflow failed in worker",
      payload: { error: (error as Error).message }
    });
    throw error;
  }
});

worker.on("failed", (job, err) => {
  console.error("Worker job failed", job?.id, err.message);
});

worker.on("completed", (job) => {
  console.log("Worker job completed", job.id);
});

process.on("SIGINT", async () => {
  await worker.close();
  process.exit(0);
});

console.log("Worker started");
