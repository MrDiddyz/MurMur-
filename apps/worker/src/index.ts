import {
  appendWorkflowEvent,
  getWorkflowById,
  saveWorkflowCheckpoint,
  saveWorkflowResult,
  updateWorkflowStatus
} from "@murmur/db";
import { registerWorkflowProcessor } from "@murmur/queue";
import { env } from "@murmur/shared";

registerWorkflowProcessor(async ({ workflowId }) => {
  console.log(`[worker] processing workflow ${workflowId}`);
  const workflow = await getWorkflowById(workflowId);
  if (!workflow || workflow.status === "cancelled") return;

  try {
    await updateWorkflowStatus(workflowId, "running");
    await appendWorkflowEvent({ workflowId, type: "worker", message: "Workflow started" });

    const res = await fetch(`${env.orchestratorUrl}/run-workflow`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ workflowId, prompt: workflow.prompt, maxIterations: workflow.maxIterations })
    });

    if (!res.ok) throw new Error(`Orchestrator failed: ${res.status}`);
    const data = await res.json() as { status: "succeeded" | "failed"; checkpoints: Array<{step:string; summary:string}>; events: Array<{type:string;message:string}>; result: {output:string}|null };

    for (const checkpoint of data.checkpoints) {
      await saveWorkflowCheckpoint({ workflowId, step: checkpoint.step, data: checkpoint });
    }
    for (const event of data.events) {
      await appendWorkflowEvent({ workflowId, type: event.type, message: event.message });
    }
    if (data.result) await saveWorkflowResult(workflowId, data.result.output);
    await updateWorkflowStatus(workflowId, data.status);
    await appendWorkflowEvent({ workflowId, type: "worker", message: `Workflow completed with status ${data.status}` });
  } catch (error) {
    console.error(`[worker] failure`, error);
    await updateWorkflowStatus(workflowId, "failed");
    await appendWorkflowEvent({ workflowId, type: "worker", message: "Workflow failed", payload: { error: String(error) } });
    throw error;
  }
});

console.log("[worker] started");
