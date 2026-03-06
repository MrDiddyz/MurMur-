import { Queue, Worker } from "bullmq";
import IORedis from "ioredis";
import { env } from "@murmur/shared";

export const WORKFLOW_QUEUE = "workflow-runs";

export type WorkflowJobPayload = {
  workflowId: string;
};

export const redisConnection = new IORedis(env.redisUrl, { maxRetriesPerRequest: null });

export const workflowQueue = new Queue<WorkflowJobPayload>(WORKFLOW_QUEUE, {
  connection: redisConnection
});

export async function enqueueWorkflowRun(payload: WorkflowJobPayload) {
  await workflowQueue.add("run", payload, { attempts: 3, backoff: { type: "exponential", delay: 1000 } });
}

export function registerWorkflowProcessor(processor: (payload: WorkflowJobPayload) => Promise<void>) {
  return new Worker<WorkflowJobPayload>(
    WORKFLOW_QUEUE,
    async job => processor(job.data),
    { connection: redisConnection }
  );
}
