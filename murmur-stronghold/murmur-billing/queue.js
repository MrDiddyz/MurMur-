import Redis from "ioredis"

export const PUBLISH_QUEUE_NAME = "publish_post"

let redisClient

function getRedis() {
  if (!redisClient) {
    redisClient = new Redis({
      host: process.env.REDIS_HOST || "redis",
      port: Number(process.env.REDIS_PORT || 6379),
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false
    })
  }
  return redisClient
}

const queueKey = `${PUBLISH_QUEUE_NAME}:ready`
const delayedKey = `${PUBLISH_QUEUE_NAME}:delayed`

function serialize(job) {
  return JSON.stringify(job)
}

function deserialize(value) {
  return JSON.parse(value)
}

export const publishQueue = {
  async add(name, data, options = {}) {
    const redis = getRedis()
    const job = {
      id: crypto.randomUUID(),
      name,
      data,
      attempts: options.attempts ?? 5,
      backoffDelay: options?.backoff?.delay ?? 1_000,
      tryCount: 0
    }

    await redis.lpush(queueKey, serialize(job))
    return job
  }
}

export function createPublishWorker(processor) {
  const redis = getRedis()
  let closed = false

  const pollDelayed = setInterval(async () => {
    const now = Date.now()
    const dueJobs = await redis.zrangebyscore(delayedKey, 0, now)
    if (dueJobs.length === 0) return

    const tx = redis.multi()
    for (const encoded of dueJobs) {
      tx.zrem(delayedKey, encoded)
      tx.lpush(queueKey, encoded)
    }
    await tx.exec()
  }, 1_000)

  async function loop() {
    while (!closed) {
      const raw = await redis.brpop(queueKey, 1)
      if (!raw) continue

      const job = deserialize(raw[1])
      try {
        await processor(job)
      } catch {
        job.tryCount += 1
        if (job.tryCount >= job.attempts) {
          continue
        }

        const delay = job.backoffDelay * 2 ** (job.tryCount - 1)
        await redis.zadd(delayedKey, Date.now() + delay, serialize(job))
      }
    }
  }

  loop()

  return {
    close() {
      closed = true
      clearInterval(pollDelayed)
    }
  }
}
