const importDynamic = (name: string) => new Function("n", "return import(n)")(name) as Promise<any>;

import { getPublishQueue } from "@/lib/scheduler/queue";
import { markPostQueued } from "@/lib/scheduler/repository";

export async function startScheduledPublishWorker(): Promise<void> {
  const bull = await importDynamic("bullmq").catch(() => null as any);
  const redis = await importDynamic("ioredis").catch(() => null as any);
  if (!bull?.Worker || !redis?.default) {
    console.warn("BullMQ/ioredis not available; scheduled publish worker is disabled.");
    return;
  }

  const connection = new redis.default(process.env.REDIS_URL ?? "redis://127.0.0.1:6379", {
    maxRetriesPerRequest: null,
  });

  new bull.Worker(
    "scheduled_publish",
    async (job: { data: { postId: string } }) => {
      const { postId } = job.data;
      await markPostQueued(postId);
      const publishQueue = await getPublishQueue();
      await publishQueue.add(
        "publish_post",
        { postId },
        {
          jobId: `publish:${postId}`,
          removeOnComplete: true,
          removeOnFail: 50,
        },
      );
    },
    { connection },
  );
}
