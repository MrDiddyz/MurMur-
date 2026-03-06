const express = require('express');
const { createClient } = require('redis');

const app = express();
app.use(express.json({ limit: '1mb' }));

const port = Number(process.env.PORT || process.env.WORKER_PORT || 3010);
const serviceName = process.env.SERVICE_NAME || 'worker';
const apiUrl = process.env.API_URL || 'http://api:3001';
const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';

const TASK_QUEUE_KEY = 'murmur:tasks:queue';
const TASK_HASH_KEY = 'murmur:tasks:data';

const redis = createClient({ url: redisUrl });
redis.on('error', (err) => console.error('[worker] redis error:', err.message));

async function connectRedis() {
  if (!redis.isOpen) {
    await redis.connect();
  }
}

async function processOneTask() {
  await connectRedis();
  const id = await redis.lPop(TASK_QUEUE_KEY);

  if (!id) {
    return { processed: false, reason: 'queue_empty' };
  }

  const raw = await redis.hGet(TASK_HASH_KEY, id);
  if (!raw) {
    return { processed: false, reason: 'missing_task_payload', id };
  }

  const task = JSON.parse(raw);
  task.status = 'completed';
  task.completedAt = new Date().toISOString();
  task.result = {
    summary: `Processed by ${serviceName}`,
    echo: task.input
  };

  await redis.hSet(TASK_HASH_KEY, id, JSON.stringify(task));

  return { processed: true, id, status: task.status };
}

app.get('/health', async (_req, res) => {
  try {
    await connectRedis();
    await redis.ping();

    const apiRes = await fetch(`${apiUrl}/health`);
    if (!apiRes.ok) {
      throw new Error(`api health returned ${apiRes.status}`);
    }

    return res.json({ ok: true, service: serviceName, port, redis: 'up', api: 'up' });
  } catch (error) {
    return res.status(503).json({ ok: false, service: serviceName, error: error.message });
  }
});

app.post('/run-once', async (_req, res) => {
  try {
    const result = await processOneTask();
    return res.json(result);
  } catch (error) {
    return res.status(500).json({ error: 'failed_to_process_task', details: error.message });
  }
});

app.get('/', (_req, res) => {
  res.json({ message: `${serviceName} running`, docs: ['/health', '/run-once (POST)'] });
});

const server = app.listen(port, () => {
  console.log(`${serviceName} listening on ${port}`);
});

async function shutdown() {
  console.log('[worker] shutting down...');
  server.close(async () => {
    if (redis.isOpen) {
      await redis.quit();
    }
    process.exit(0);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
