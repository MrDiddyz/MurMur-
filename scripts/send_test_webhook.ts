import crypto from "node:crypto";

const webhookUrl = process.env.WEBHOOK_URL ?? "http://localhost:3001/webhooks/tiktok";
const secret = process.env.TIKTOK_WEBHOOK_SECRET ?? "dev-tiktok-webhook-secret";

function signPayload(body: string, timestamp: number, key: string): string {
  return crypto.createHmac("sha256", key).update(`${timestamp}.${body}`).digest("hex");
}

async function send(payload: unknown, signature: string, timestamp: number) {
  const body = JSON.stringify(payload);
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-tt-signature": signature,
      "x-tt-timestamp": String(timestamp),
    },
    body,
  });

  const text = await response.text();
  let json: Record<string, unknown> | null = null;
  try {
    json = JSON.parse(text) as Record<string, unknown>;
  } catch {
    json = null;
  }

  return { status: response.status, text, json };
}

function assert(condition: unknown, message: string): asserts condition {
  if (!condition) {
    throw new Error(message);
  }
}

async function main() {
  const eventId = `verify-${Date.now()}`;
  const payload = {
    event_id: eventId,
    type: "noop.test",
    data: { status: "ok" },
  };
  const payloadString = JSON.stringify(payload);

  const nowTs = Math.floor(Date.now() / 1000);
  const validSig = signPayload(payloadString, nowTs, secret);

  const invalidResult = await send(payload, "definitely-invalid", nowTs);
  assert(invalidResult.status === 401, `Expected 401 for invalid signature, got ${invalidResult.status}`);

  const staleTs = nowTs - 3600;
  const staleSig = signPayload(payloadString, staleTs, secret);
  const staleResult = await send(payload, staleSig, staleTs);
  assert(staleResult.status === 401, `Expected 401 for stale timestamp, got ${staleResult.status}`);

  const validResult = await send(payload, validSig, nowTs);
  assert(validResult.status === 200, `Expected 200 for valid signature, got ${validResult.status}`);

  const dupResult = await send(payload, validSig, nowTs);
  assert(dupResult.status === 200, `Expected 200 for duplicate valid event, got ${dupResult.status}`);
  assert(dupResult.json?.duplicate === true, "Expected duplicate response marker for replay event");

  console.log("[verify:webhook] PASS");
}

main().catch((error) => {
  console.error("[verify:webhook] FAIL:", error instanceof Error ? error.message : error);
  process.exit(1);
});
