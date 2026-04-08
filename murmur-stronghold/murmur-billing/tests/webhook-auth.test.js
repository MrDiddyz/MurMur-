import test from "node:test"
import assert from "node:assert/strict"
import crypto from "node:crypto"
import { ReplayProtector, verifyWebhookSignature } from "../auth.js"

function sign(body, timestamp, secret) {
  return crypto.createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex")
}

test("verifyWebhookSignature validates correct signature", () => {
  process.env.TIKTOK_WEBHOOK_SECRET = "top-secret"
  const body = JSON.stringify({ event_id: "evt_1", type: "publish.status_change" })
  const timestamp = Math.floor(Date.now() / 1000)
  const signature = sign(body, timestamp, process.env.TIKTOK_WEBHOOK_SECRET)

  const result = verifyWebhookSignature(
    Buffer.from(body),
    signature,
    String(timestamp),
    "nonce-1",
    new ReplayProtector()
  )
  assert.equal(result.valid, true)
})

test("verifyWebhookSignature rejects invalid signature", () => {
  process.env.TIKTOK_WEBHOOK_SECRET = "top-secret"
  const body = JSON.stringify({ event_id: "evt_2" })
  const timestamp = Math.floor(Date.now() / 1000)

  const result = verifyWebhookSignature(
    Buffer.from(body),
    "bad-signature",
    String(timestamp),
    "nonce-2",
    new ReplayProtector()
  )
  assert.equal(result.valid, false)
  assert.equal(result.reason, "signature mismatch")
})

test("verifyWebhookSignature rejects replay attack with duplicate nonce/timestamp", () => {
  process.env.TIKTOK_WEBHOOK_SECRET = "top-secret"
  const body = JSON.stringify({ event_id: "evt_3" })
  const nowMs = Date.now()
  const timestamp = Math.floor(nowMs / 1000)
  const signature = sign(body, timestamp, process.env.TIKTOK_WEBHOOK_SECRET)
  const protector = new ReplayProtector()

  const firstAttempt = verifyWebhookSignature(
    Buffer.from(body),
    signature,
    String(timestamp),
    "nonce-3",
    protector,
    nowMs
  )
  assert.equal(firstAttempt.valid, true)

  const replayAttempt = verifyWebhookSignature(
    Buffer.from(body),
    signature,
    String(timestamp),
    "nonce-3",
    protector,
    nowMs
  )
  assert.equal(replayAttempt.valid, false)
  assert.equal(replayAttempt.reason, "replay detected")
})

test("verifyWebhookSignature rejects expired timestamp", () => {
  process.env.TIKTOK_WEBHOOK_SECRET = "top-secret"
  const nowMs = Date.now()
  const staleTimestamp = Math.floor((nowMs - 301_000) / 1000)
  const body = JSON.stringify({ event_id: "evt_4" })
  const signature = sign(body, staleTimestamp, process.env.TIKTOK_WEBHOOK_SECRET)

  const result = verifyWebhookSignature(
    Buffer.from(body),
    signature,
    String(staleTimestamp),
    "nonce-4",
    new ReplayProtector(),
    nowMs
  )
  assert.equal(result.valid, false)
  assert.equal(result.reason, "timestamp too old")
})
