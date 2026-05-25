#!/usr/bin/env node

const [,, domain, action, value] = process.argv;
const api = process.env.MURMUR_API || 'http://localhost:8081';
const token = process.env.MURMUR_TOKEN;

if (!token) {
  console.error('MURMUR_TOKEN is required');
  process.exit(1);
}

const headers = {
  'content-type': 'application/json',
  authorization: `Bearer ${token}`
};

async function run() {
  if (domain === 'node' && action === 'spawn') {
    const res = await fetch(`${api}/nodes`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ name: value || `node-${Date.now()}` })
    });
    console.log(await res.text());
    return;
  }

  if (domain === 'node' && action === 'list') {
    const res = await fetch(`${api}/nodes`, { headers });
    console.log(await res.text());
    return;
  }

  if (domain === 'logs' && action === 'tail') {
    console.log(JSON.stringify({ ok: true, message: `tail logs stub for ${value}` }));
    return;
  }

  console.log('Usage: murmur node spawn <name> | murmur node list | murmur logs tail <nodeId>');
}

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
