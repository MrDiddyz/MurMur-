const express = require('express');

const app = express();
const port = Number(process.env.PORT || process.env.WEB_PORT || 3000);
const serviceName = process.env.SERVICE_NAME || 'web';
const apiUrl = process.env.API_URL || 'http://api:3001';

app.get('/health', async (_req, res) => {
  try {
    const apiRes = await fetch(`${apiUrl}/health`);
    if (!apiRes.ok) {
      throw new Error(`api health returned ${apiRes.status}`);
    }

    const apiHealth = await apiRes.json();
    return res.json({ ok: true, service: serviceName, port, api: apiHealth.ok ? 'up' : 'degraded' });
  } catch (error) {
    return res.status(503).json({ ok: false, service: serviceName, error: error.message });
  }
});

app.get('/', (_req, res) => {
  res.type('html').send(`
    <h1>MurMur local stack</h1>
    <p>Web service is running.</p>
    <ul>
      <li><a href="/health">/health</a></li>
      <li>API health proxied from: ${apiUrl}/health</li>
    </ul>
  `);
});

const server = app.listen(port, () => {
  console.log(`${serviceName} listening on ${port}`);
});

function shutdown() {
  console.log('[web] shutting down...');
  server.close(() => process.exit(0));
}

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
