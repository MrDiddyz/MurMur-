import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { config } from './config';

export const queueNames = {
  publishPost: 'publish_post',
  pollStatus: 'poll_status',
  refreshToken: 'refresh_token'
} as const;

type QueueRegistry = {
  publishPost: Queue;
  pollStatus: Queue;
  refreshToken: Queue;
};

let redisConnection: IORedis | null = null;
let queueRegistry: QueueRegistry | null = null;

export const getRedisConnection = (): IORedis => {
  if (!redisConnection) {
    redisConnection = new IORedis(config.REDIS_URL, { maxRetriesPerRequest: null });
  }

  return redisConnection;
};

export const getQueues = (): QueueRegistry => {
  if (!queueRegistry) {
    const connection = getRedisConnection();
    queueRegistry = {
      publishPost: new Queue(queueNames.publishPost, { connection }),
      pollStatus: new Queue(queueNames.pollStatus, { connection }),
      refreshToken: new Queue(queueNames.refreshToken, { connection })
    };
  }

  return queueRegistry;
};

export const closeQueues = async (): Promise<void> => {
  if (queueRegistry) {
    await Promise.all([
      queueRegistry.publishPost.close(),
      queueRegistry.pollStatus.close(),
      queueRegistry.refreshToken.close()
    ]);
    queueRegistry = null;
  }
};

export const closeRedisConnection = async (): Promise<void> => {
  if (redisConnection) {
    await redisConnection.quit();
    redisConnection = null;
  }
};
