import test from "node:test"
import assert from "node:assert/strict"
import crypto from "node:crypto"
import { verifyStripeWebhookEvent, verifyWebhookSignature } from "../auth.js"

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

test("verifyStripeWebhookEvent rejects when secret is missing", () => {
  delete process.env.STRIPE_WEBHOOK_SECRET
  const stripe = { webhooks: { constructEvent: () => ({ id: "evt_x" }) } }

  assert.throws(() => verifyStripeWebhookEvent(stripe, Buffer.from("{}"), "sig"), /missing stripe webhook secret/)
})

test("verifyStripeWebhookEvent delegates to Stripe SDK constructEvent", () => {
  process.env.STRIPE_WEBHOOK_SECRET = "whsec_123"

  let received
  const expectedEvent = { id: "evt_123", type: "checkout.session.completed" }
  const stripe = {
    webhooks: {
      constructEvent: (rawBody, signature, webhookSecret) => {
        received = { rawBody, signature, webhookSecret }
        return expectedEvent
      },
    },
  }

  const rawBody = Buffer.from('{"id":"evt_123"}')
  const event = verifyStripeWebhookEvent(stripe, rawBody, "t=1,v1=abc")

  assert.deepEqual(event, expectedEvent)
  assert.equal(received.rawBody, rawBody)
  assert.equal(received.signature, "t=1,v1=abc")
  assert.equal(received.webhookSecret, "whsec_123")
})
