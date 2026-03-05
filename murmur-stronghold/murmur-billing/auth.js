import crypto from "node:crypto"

const WEBHOOK_MAX_AGE_SECONDS = 300

function safeEqualText(left, right) {
  const leftBuffer = Buffer.from(String(left), "utf8")
  const rightBuffer = Buffer.from(String(right), "utf8")
  if (leftBuffer.length !== rightBuffer.length) {
    return false
  }
  return crypto.timingSafeEqual(leftBuffer, rightBuffer)
}

export class ReplayProtector {
  constructor(ttlSeconds = WEBHOOK_MAX_AGE_SECONDS) {
    this.ttlMs = ttlSeconds * 1000
    this.seen = new Map()
  }

  isReplay(nonce, timestamp, nowMs = Date.now()) {
    const key = `${timestamp}:${nonce}`
    const expiresAt = this.seen.get(key)
    if (expiresAt && expiresAt >= nowMs) {
      return true
    }

    this.seen.set(key, nowMs + this.ttlMs)

    for (const [seenKey, seenExpiresAt] of this.seen.entries()) {
      if (seenExpiresAt < nowMs) {
        this.seen.delete(seenKey)
      }
    }

    return false
  }
}

export function requireWebhookAuth(req) {
  const configuredToken = process.env.TIKTOK_WEBHOOK_AUTH_TOKEN
  if (!configuredToken) {
    return { valid: false, reason: "missing webhook auth configuration" }
  }

  const providedToken = req.headers["x-webhook-auth"]
  if (!providedToken) {
    return { valid: false, reason: "missing webhook auth" }
  }

  if (!safeEqualText(providedToken, configuredToken)) {
    return { valid: false, reason: "invalid webhook auth" }
  }

  return { valid: true }
}

export function requireStripeSignature(req) {
  const signature = req.headers["stripe-signature"]
  if (!signature) {
    throw new Error("missing stripe signature")
  }
  return signature
}

export function verifyWebhookSignature(
  rawBody,
  signature,
  timestamp,
  nonce,
  replayProtector,
  nowMs = Date.now()
) {
  if (!signature) {
    return { valid: false, reason: "missing signature" }
  }

  const tsSeconds = Number(timestamp)
  if (!Number.isFinite(tsSeconds)) {
    return { valid: false, reason: "invalid timestamp" }
  }

  const ageSeconds = Math.floor(nowMs / 1000) - tsSeconds
  if (ageSeconds < 0 || ageSeconds > WEBHOOK_MAX_AGE_SECONDS) {
    return { valid: false, reason: "timestamp too old" }
  }

  if (!nonce) {
    return { valid: false, reason: "missing nonce" }
  }

  const secret = process.env.TIKTOK_WEBHOOK_SECRET
  if (!secret) {
    return { valid: false, reason: "missing webhook secret" }
  }

  const signedPayload = `${tsSeconds}.${rawBody.toString("utf8")}`
  const expected = crypto.createHmac("sha256", secret).update(signedPayload).digest("hex")

  if (!safeEqualText(signature, expected)) {
    return { valid: false, reason: "signature mismatch" }
  }

  if (replayProtector?.isReplay(nonce, tsSeconds, nowMs)) {
    return { valid: false, reason: "replay detected" }
  }

  return { valid: true }
}
