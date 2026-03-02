import { Job, Worker } from 'bullmq';
import { getRedisConnection, queueNames } from '../../../shared/queue';
import { query } from '../../../shared/db';

type PublishJobData = { postId: string; accountId: string };
type PollStatusJobData = { postId: string; publishId: string };
type RefreshTokenJobData = { accountId: string };

const connection = getRedisConnection();

const handlePublishPost = async (job: Job<PublishJobData>): Promise<void> => {
  const { postId } = job.data;

  if (!postId) {
    throw new Error('Missing postId for publish_post job');
  }

  await query(`UPDATE posts SET status = 'published', updated_at = NOW() WHERE id = $1`, [postId]);
  console.log(`Processed publish_post for post ${postId}`);
};

const handlePollStatus = async (job: Job<PollStatusJobData>): Promise<void> => {
  const { postId, publishId } = job.data;
  if (!postId || !publishId) {
    throw new Error('Missing postId or publishId for poll_status job');
  }

  console.log(`Processed poll_status for post=${postId} publishId=${publishId}`);
};

const handleRefreshToken = async (job: Job<RefreshTokenJobData>): Promise<void> => {
  const { accountId } = job.data;
  if (!accountId) {
    throw new Error('Missing accountId for refresh_token job');
  }

  console.log(`Processed refresh_token for account ${accountId}`);
};

const workers = [
  new Worker(queueNames.publishPost, handlePublishPost, { connection }),
  new Worker(queueNames.pollStatus, handlePollStatus, { connection }),
  new Worker(queueNames.refreshToken, handleRefreshToken, { connection })
];

workers.forEach((worker) => {
  worker.on('failed', async (job, err) => {
    console.error(`Worker failed for ${job?.queueName}:`, err.message);

    if (job?.queueName === queueNames.publishPost && job.data && (job.data as PublishJobData).postId) {
      const postId = (job.data as PublishJobData).postId;
      await query(`UPDATE posts SET status = 'failed', updated_at = NOW() WHERE id = $1`, [postId]);
    }
  });
});

let shuttingDown = false;

const shutdown = async (signal: string): Promise<void> => {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  console.log(`Received ${signal}. Closing workers...`);
  await Promise.all(workers.map((worker) => worker.close()));
  await connection.quit();
  process.exit(0);
};

process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
