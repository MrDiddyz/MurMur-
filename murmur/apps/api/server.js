const express = require('express');
const { createClient } = require('redis');
const crypto = require('crypto');

const app = express();
app.use(express.json({ limit: '1mb' }));

const port = Number(process.env.PORT || process.env.API_PORT || 3001);
const serviceName = process.env.SERVICE_NAME || 'api';
const redisUrl = process.env.REDIS_URL || 'redis://redis:6379';

const TASK_QUEUE_KEY = 'murmur:tasks:queue';
const TASK_HASH_KEY = 'murmur:tasks:data';

const redis = createClient({ url: redisUrl });
redis.on('error', (err) => console.error('[api] redis error:', err.message));

async function connectRedis() {
  if (!redis.isOpen) {
    await redis.connect();
  }
}

app.get('/health', async (_req, res) => {
  try {
    await connectRedis();
    await redis.ping();
    return res.json({ ok: true, service: serviceName, port, redis: 'up' });
  } catch (error) {
    return res.status(503).json({ ok: false, service: serviceName, redis: 'down', error: error.message });
  }
});

app.get('/', (_req, res) => {
  res.json({ message: `${serviceName} running`, docs: ['/health', '/tasks (POST)', '/tasks/:id (GET)'] });
});

app.post('/tasks', async (req, res) => {
  try {
    await connectRedis();

    const payload = req.body && typeof req.body === 'object' ? req.body : {};
    const agent = String(payload.agent || 'unknown-agent');
    const input = payload.input || {};
    const id = crypto.randomUUID();

    const task = {
      id,
      agent,
      input,
      status: 'queued',
      createdAt: new Date().toISOString()
    };

    await redis.hSet(TASK_HASH_KEY, id, JSON.stringify(task));
    await redis.rPush(TASK_QUEUE_KEY, id);

    return res.status(202).json(task);
  } catch (error) {
    return res.status(500).json({ error: 'failed_to_enqueue_task', details: error.message });
  }
});

app.get('/tasks/:id', async (req, res) => {
  try {
    await connectRedis();

    const raw = await redis.hGet(TASK_HASH_KEY, req.params.id);
    if (!raw) {
      return res.status(404).json({ error: 'task_not_found', id: req.params.id });
    }

    return res.json(JSON.parse(raw));
  } catch (error) {
    return res.status(500).json({ error: 'failed_to_read_task', details: error.message });
  }
});

const server = app.listen(port, () => {
  console.log(`${serviceName} listening on ${port}`);
});

async function shutdown() {
  console.log('[api] shutting down...');
  server.close(async () => {
    if (redis.isOpen) {
      await redis.quit();
    }
    process.exit(0);
  });
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
