const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:3000';

const events = [
  { source: 'door_sensor', device_id: 'door-1', event_type: 'door_open', payload: { at: 'front' } },
  { source: 'motion', device_id: 'motion-1', event_type: 'motion', payload: { zone: 'hallway' } },
  { source: 'camera', device_id: 'cam-1', event_type: 'tamper', payload: { reason: 'cover_blocked' } }
];

async function waitForHealth(maxAttempts = 20, delayMs = 250) {
  for (let i = 0; i < maxAttempts; i += 1) {
    try {
      const resp = await fetch(`${BASE}/health`);
      if (resp.ok) return;
    } catch (_e) {
      // keep retrying
    }

    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }

  throw new Error(`Server not reachable at ${BASE}. Start it with: npm start`);
}

await waitForHealth();

let created = 0;

for (const evt of events) {
  const resp = await fetch(`${BASE}/events`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(evt)
  });

  if (!resp.ok) {
    const body = await resp.text();
    throw new Error(`Failed posting event (${resp.status}): ${body}`);
  }

  const data = await resp.json();
  if (data.created_alert === true) created += 1;
}

if (created !== 2) {
  console.error(`❌ Golden run failed: expected 2 alerts but got ${created}`);
  process.exit(1);
}

console.log('✅ Golden run OK: 3 events -> 2 alerts');
