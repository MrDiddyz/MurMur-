import Fastify from "fastify"
import Stripe from "stripe"
import pkg from "pg"
import Redis from "ioredis"
import { requireStripeSignature, verifyWebhookSignature } from "./auth.js"

const { Pool } = pkg
const fastify = Fastify({ logger: true, bodyLimit: 1024 * 1024 })
const stripe = new Stripe(process.env.STRIPE_KEY)

const db = new Pool({ connectionString: process.env.DATABASE_URL })
const redis = new Redis({ host: process.env.REDIS_HOST })

const rateLimitWindowMs = 60_000
const rateLimitMaxPerIp = 60
const requestCounter = new Map()

setInterval(() => {
  const now = Date.now()
  for (const [ip, bucket] of requestCounter.entries()) {
    if (now > bucket.resetAt) {
      requestCounter.delete(ip)
    }
  }
}, rateLimitWindowMs).unref()

fastify.addHook("onRequest", async (req, res) => {
  const ip = req.ip
  const now = Date.now()
  const current = requestCounter.get(ip) ?? { count: 0, resetAt: now + rateLimitWindowMs }

  if (now > current.resetAt) {
    current.count = 0
    current.resetAt = now + rateLimitWindowMs
  }

  current.count += 1
  requestCounter.set(ip, current)

  if (current.count > rateLimitMaxPerIp) {
    return res.code(429).send({ error: "rate limit exceeded" })
  }
})

fastify.addContentTypeParser("application/json", { parseAs: "buffer" }, (req, body, done) => {
  req.rawBody = body
  done(null, body)
})

fastify.post("/webhooks/tiktok", async (req, res) => {
  const signature = req.headers["x-tt-signature"]
  const timestamp = req.headers["x-tt-timestamp"]

  const verification = verifyWebhookSignature(req.rawBody, signature, timestamp)
  if (!verification.valid) {
    req.log.warn({ reason: verification.reason }, "tiktok webhook rejected")
    return res.code(401).send({ error: "invalid signature" })
  }

  let payload
  try {
    payload = JSON.parse(req.rawBody.toString("utf8"))
  } catch {
    return res.code(400).send({ error: "invalid payload" })
  }

  const eventId = payload?.event_id
  if (!eventId) {
    return res.code(400).send({ error: "missing event_id" })
  }

  try {
    const result = await db.query(
      `INSERT INTO webhook_events(event_id, received_at, payload)
       VALUES ($1, NOW(), $2)
       ON CONFLICT (event_id) DO NOTHING`,
      [eventId, payload]
    )

    if (result.rowCount === 0) {
      req.log.info({ eventId }, "duplicate tiktok webhook ignored")
      return res.send({ ok: true, duplicate: true })
    }

    if (payload?.type === "publish.status_change") {
      const publishId = payload?.data?.tiktok_publish_id ?? payload?.data?.publish_id
      const publishStatus = payload?.data?.status
      const errorMessage = payload?.data?.error_message ?? null

      if (!publishId || !publishStatus) {
        return res.code(400).send({ error: "missing publish metadata" })
      }

      const updateResult = await db.query(
        `UPDATE posts
         SET status = $1,
             error_message = $2,
             updated_at = NOW()
         WHERE tiktok_publish_id = $3`,
        [publishStatus, errorMessage, publishId]
      )

      req.log.info(
        { eventId, eventType: payload.type, publishId, updatedRows: updateResult.rowCount },
        "tiktok webhook processed"
      )
    } else {
      req.log.info({ eventId, eventType: payload?.type }, "tiktok webhook ignored")
    }

    return res.send({ ok: true })
  } catch (error) {
    req.log.error({ err: error, eventId }, "failed processing tiktok webhook")
    return res.code(500).send({ ok: false })
  }
})

fastify.get("/webhooks/tiktok/health", async () => {
  return { ok: true }
})

fastify.post("/webhook", async (req, res) => {
  let sig
  try {
    sig = requireStripeSignature(req)
  } catch {
    return res.code(400).send("invalid")
  }

  let event
  try {
    event = stripe.webhooks.constructEvent(req.rawBody, sig, process.env.STRIPE_WEBHOOK_SECRET)
  } catch {
    return res.code(400).send("invalid")
  }

  const client = await db.connect()
  let shouldEnqueue = false
  let intentId = null

  try {
    await client.query("BEGIN")

    const insertEvent = await client.query(
      "INSERT INTO payment_events(id,type,payload) VALUES($1,$2,$3) ON CONFLICT (id) DO NOTHING",
      [event.id, event.type, event]
    )

    if (insertEvent.rowCount === 0) {
      await client.query("ROLLBACK")
      return res.send({ ok: true, duplicate: true })
    }

    if (event.type === "checkout.session.completed") {
      intentId = Number(event?.data?.object?.metadata?.intentId)
      if (!Number.isInteger(intentId) || intentId <= 0) {
        await client.query("ROLLBACK")
        return res.code(400).send({ error: "missing intentId metadata" })
      }

      const updatedIntent = await client.query(
        "UPDATE payment_intents SET status='queued' WHERE id=$1",
        [intentId]
      )
      if (updatedIntent.rowCount === 0) {
        await client.query("ROLLBACK")
        return res.code(404).send({ error: "payment intent not found" })
      }

      await client.query(
        `INSERT INTO jobs(intent_id,status,retries)
         VALUES($1,$2,0)
         ON CONFLICT (intent_id)
         DO UPDATE SET status=EXCLUDED.status`,
        [intentId, "queued"]
      )
      shouldEnqueue = true
    }

    await client.query("COMMIT")
  } catch (error) {
    await client.query("ROLLBACK")
    req.log.error({ err: error }, "failed processing webhook")
    return res.code(500).send({ received: false })
  } finally {
    client.release()
  }

  if (shouldEnqueue) {
    try {
      await redis.lpush("agent_queue", String(intentId))
    } catch (error) {
      req.log.error({ err: error, intentId }, "failed enqueueing job after DB commit")
      await db.query("UPDATE jobs SET status='queue_error' WHERE intent_id=$1", [intentId])
      return res.code(503).send({ received: false, retryable: true })
    }
  }

  return res.send({ received: true })
})

fastify.get("/health", async () => {
  await db.query("SELECT 1")
  await redis.ping()
  return { status: "ok" }
})

fastify.listen({ port: 3001, host: "0.0.0.0" })
