import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const relativePath = process.argv[2];
if (!relativePath) {
  console.error('Usage: node scripts/emit-event.js <path-to-event-json>');
  process.exit(1);
}

const eventPath = path.resolve(__dirname, '..', relativePath);
const eventPayload = JSON.parse(fs.readFileSync(eventPath, 'utf8'));
const webhookUrl = process.env.EVENT_BUS_WEBHOOK_URL;

if (!webhookUrl) {
  console.log(JSON.stringify({
    mode: 'stdout',
    emittedAt: new Date().toISOString(),
    event: eventPayload
  }, null, 2));
  process.exit(0);
}

const response = await fetch(webhookUrl, {
  method: 'POST',
  headers: {
    'content-type': 'application/json'
  },
  body: JSON.stringify(eventPayload)
});

if (!response.ok) {
  console.error(`Failed to emit event (${response.status} ${response.statusText})`);
  process.exit(1);
}

console.log(`Event emitted to ${webhookUrl}`);
