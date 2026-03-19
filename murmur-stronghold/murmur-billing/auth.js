import crypto from "node:crypto"

const WEBHOOK_MAX_AGE_SECONDS = 300

export function requireStripeSignature(req) {
  const signature = req.headers["stripe-signature"]
  if (!signature) {
    throw new Error("missing stripe signature")
  }
  return signature
}

export function verifyWebhookSignature(rawBody, signature, timestamp, nowMs = Date.now()) {
  if (!signature) {
    return { valid: false, reason: "missing signature" }
  }

  const tsSeconds = Number(timestamp)
  if (!Number.isFinite(tsSeconds)) {
    return { valid: false, reason: "invalid timestamp" }
  }

  const ageSeconds = Math.floor(nowMs / 1000) - tsSeconds
  if (ageSeconds > WEBHOOK_MAX_AGE_SECONDS) {
    return { valid: false, reason: "timestamp too old" }
  }

  const secret = process.env.TIKTOK_WEBHOOK_SECRET
  if (!secret) {
    return { valid: false, reason: "missing webhook secret" }
  }

  const signedPayload = `${tsSeconds}.${rawBody.toString("utf8")}`
  const expected = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex")

  const receivedBuffer = Buffer.from(signature, "utf8")
  const expectedBuffer = Buffer.from(expected, "utf8")

  if (receivedBuffer.length !== expectedBuffer.length) {
    return { valid: false, reason: "signature mismatch" }
  }

  if (!crypto.timingSafeEqual(receivedBuffer, expectedBuffer)) {
    return { valid: false, reason: "signature mismatch" }
  }

  return { valid: true }
}
