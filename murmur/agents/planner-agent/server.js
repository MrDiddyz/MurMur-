const express = require('express');

const app = express();
app.use(express.json({ limit: '1mb' }));

const port = Number(process.env.PORT || 3100);
const agentName = process.env.AGENT_NAME || 'agent';
const apiUrl = process.env.API_URL || 'http://api:3001';
const workerUrl = process.env.WORKER_URL || 'http://worker:3010';

app.get('/health', async (_req, res) => {
  try {
    const [apiRes, workerRes] = await Promise.all([
      fetch(`${apiUrl}/health`),
      fetch(`${workerUrl}/health`)
    ]);

    if (!apiRes.ok || !workerRes.ok) {
      throw new Error(`deps unhealthy (api=${apiRes.status}, worker=${workerRes.status})`);
    }

    return res.json({ ok: true, service: agentName, port, api: 'up', worker: 'up' });
  } catch (error) {
    return res.status(503).json({ ok: false, service: agentName, error: error.message });
  }
});

app.post('/execute', async (req, res) => {
  try {
    const input = req.body && typeof req.body === 'object' ? req.body : {};

    const createRes = await fetch(`${apiUrl}/tasks`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ agent: agentName, input })
    });

    if (!createRes.ok) {
      const body = await createRes.text();
      throw new Error(`api task creation failed (${createRes.status}): ${body}`);
    }

    const task = await createRes.json();

    const runRes = await fetch(`${workerUrl}/run-once`, { method: 'POST' });
    if (!runRes.ok) {
      const body = await runRes.text();
      throw new Error(`worker run failed (${runRes.status}): ${body}`);
    }

    const run = await runRes.json();
    return res.status(202).json({ task, run });
  } catch (error) {
    return res.status(500).json({ error: 'agent_execution_failed', details: error.message });
  }
});

app.get('/', (_req, res) => {
  res.json({
    message: `${agentName} running`,
    docs: ['/health', '/execute (POST)']
  });
});

const server = app.listen(port, () => {
  console.log(`${agentName} listening on ${port}`);
});

function shutdown() {
  console.log(`[${agentName}] shutting down...`);
  server.close(() => process.exit(0));
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
