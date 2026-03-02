const importDynamic = (name: string) => new Function("n", "return import(n)")(name) as Promise<any>;

import { getPublishDelayMs } from "./delayedJob";

type QueueJobOptions = {
  jobId?: string;
  delay?: number;
  removeOnComplete?: boolean;
  removeOnFail?: number;
};

type QueueAdapter = {
  add: (name: string, data: unknown, opts?: QueueJobOptions) => Promise<void>;
};

function createNoopQueue(): QueueAdapter {
  return {
    async add() {
      return;
    },
  };
}

async function createBullMqQueue(name: string): Promise<QueueAdapter> {
  const bull = await importDynamic("bullmq").catch(() => null as any);
  const redis = await importDynamic("ioredis").catch(() => null as any);

  if (!bull?.Queue || !redis?.default) {
    return createNoopQueue();
  }

  const connection = new redis.default(process.env.REDIS_URL ?? "redis://127.0.0.1:6379", {
    maxRetriesPerRequest: null,
  });

  const queue = new bull.Queue(name, { connection });
  return {
    add: (jobName, data, opts) => queue.add(jobName, data, opts),
  };
}

let scheduledQueuePromise: Promise<QueueAdapter> | null = null;
let publishQueuePromise: Promise<QueueAdapter> | null = null;

async function getScheduledQueue() {
  scheduledQueuePromise ??= createBullMqQueue("scheduled_publish");
  return scheduledQueuePromise;
}

export async function getPublishQueue() {
  publishQueuePromise ??= createBullMqQueue("publish_post");
  return publishQueuePromise;
}

export async function enqueueScheduledPublish(postId: string, scheduledAt: Date): Promise<void> {
  const queue = await getScheduledQueue();
  await queue.add(
    "scheduled_publish",
    { postId, scheduledAt: scheduledAt.toISOString() },
    {
      jobId: `scheduled:${postId}`,
      delay: getPublishDelayMs(scheduledAt),
      removeOnComplete: true,
      removeOnFail: 50,
    },
  );
}
