import test from "node:test"
import assert from "node:assert/strict"
import crypto from "node:crypto"
import { verifyWebhookSignature } from "../auth.js"

function sign(body, timestamp, secret) {
  return crypto.createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex")
}

test("verifyWebhookSignature validates correct signature", () => {
  process.env.TIKTOK_WEBHOOK_SECRET = "top-secret"
  const body = JSON.stringify({ event_id: "evt_1", type: "publish.status_change" })
  const timestamp = Math.floor(Date.now() / 1000)
  const signature = sign(body, timestamp, process.env.TIKTOK_WEBHOOK_SECRET)

  const result = verifyWebhookSignature(Buffer.from(body), signature, String(timestamp))
  assert.equal(result.valid, true)
})

test("verifyWebhookSignature rejects replay attack with stale timestamp", () => {
  process.env.TIKTOK_WEBHOOK_SECRET = "top-secret"
  const nowMs = Date.now()
  const staleTimestamp = Math.floor((nowMs - 301_000) / 1000)
  const body = JSON.stringify({ event_id: "evt_2" })
  const signature = sign(body, staleTimestamp, process.env.TIKTOK_WEBHOOK_SECRET)

  const result = verifyWebhookSignature(Buffer.from(body), signature, String(staleTimestamp), nowMs)
  assert.equal(result.valid, false)
  assert.equal(result.reason, "timestamp too old")
})

test("verifyWebhookSignature rejects invalid timestamp", () => {
  process.env.TIKTOK_WEBHOOK_SECRET = "top-secret"
  const body = JSON.stringify({ event_id: "evt_3" })
  const signature = sign(body, Math.floor(Date.now() / 1000), process.env.TIKTOK_WEBHOOK_SECRET)

  const result = verifyWebhookSignature(Buffer.from(body), signature, "not-a-number")
  assert.equal(result.valid, false)
  assert.equal(result.reason, "invalid timestamp")
})
