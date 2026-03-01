import Fastify from "fastify"
import Stripe from "stripe"
import pkg from "pg"
import Redis from "ioredis"
import { requireStripeSignature } from "./auth.js"

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
  try {
    done(null, JSON.parse(body.toString("utf8")))
  } catch (err) {
    done(err)
  }
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
