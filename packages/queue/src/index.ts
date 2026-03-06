import { Queue, Worker, type JobsOptions } from "bullmq";
import IORedis from "ioredis";
import { QUEUE_NAMES } from "@murmur/shared";

export interface WorkflowJobData {
  workflowId: string;
}

const redisConnection = new IORedis(process.env.REDIS_URL ?? "redis://localhost:6379", {
  maxRetriesPerRequest: null
});

export const workflowQueue = new Queue<WorkflowJobData>(QUEUE_NAMES.WORKFLOWS, {
  connection: redisConnection
});

export async function enqueueWorkflowJob(data: WorkflowJobData, opts?: JobsOptions) {
  return workflowQueue.add("run-workflow", data, {
    attempts: 3,
    backoff: { type: "exponential", delay: 1000 },
    removeOnComplete: 200,
    removeOnFail: 200,
    ...opts
  });
}

export function createWorkflowWorker(
  processor: Parameters<typeof Worker<WorkflowJobData>>[1],
  concurrency = Number(process.env.WORKER_CONCURRENCY ?? 5)
) {
  return new Worker<WorkflowJobData>(QUEUE_NAMES.WORKFLOWS, processor, {
    connection: redisConnection,
    concurrency
  });
}
