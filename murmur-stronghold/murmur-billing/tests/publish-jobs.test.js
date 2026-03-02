import test from "node:test"
import assert from "node:assert/strict"
import { handlePollStatusJob, handlePublishPostJob } from "../publish-jobs.js"
import { ensureAccessToken } from "../tiktok-service.js"

function createDb(rows = []) {
  const calls = []
  return {
    calls,
    async query(sql, params) {
      calls.push({ sql, params })
      if (sql.includes("FROM posts p") && sql.includes("WHERE p.id = $1")) {
        return { rowCount: rows.length, rows }
      }
      if (sql.includes("FROM posts p") && sql.includes("WHERE p.id=$1")) {
        return { rowCount: rows.length, rows }
      }
      return { rowCount: 1, rows: [] }
    }
  }
}

test("publish job flow initializes upload and schedules polling", async () => {
  const db = createDb([
    {
      id: "post-1",
      account_id: "acct-1",
      caption: "hello",
      video_url: "https://cdn/video.mp4",
      access_token: "token",
      refresh_token: "refresh",
      access_token_expires_at: new Date(Date.now() + 10_000).toISOString()
    }
  ])

  const queueCalls = []
  const queue = { add: async (...args) => queueCalls.push(args) }
  const services = {
    ensureAccessToken: async () => "valid-token",
    initDirectVideoPublish: async () => ({ publishId: "pub-1", uploadUrl: "https://upload.url" }),
    uploadVideo: async () => {}
  }

  await handlePublishPostJob({ data: { postId: "post-1" } }, { db, queue, services })
  assert.equal(queueCalls.length, 1)
  assert.equal(queueCalls[0][0], "poll_status")
  assert.equal(queueCalls[0][1].publishId, "pub-1")
})

test("polling job marks post published", async () => {
  const db = createDb([
    {
      account_id: "acct-1",
      access_token: "token",
      refresh_token: "refresh",
      access_token_expires_at: new Date(Date.now() + 10_000).toISOString()
    }
  ])

  await handlePollStatusJob(
    { data: { postId: "post-2", publishId: "pub-2" } },
    {
      db,
      services: {
        ensureAccessToken: async () => "token",
        getPublishStatus: async () => ({ status: "PUBLISHED", errorMessage: null })
      }
    }
  )

  const updateQuery = db.calls.find((call) => call.sql.includes("status='published'"))
  assert.ok(updateQuery)
})

test("token refresh is used when expired", async () => {
  const db = {
    calls: [],
    async query(sql, params) {
      this.calls.push({ sql, params })
      return { rowCount: 1 }
    }
  }

  const originalFetch = global.fetch
  global.fetch = async () => ({
    ok: true,
    async json() {
      return { access_token: "new-access", refresh_token: "new-refresh", expires_in: 3600 }
    }
  })

  const token = await ensureAccessToken(db, {
    account_id: "acct-1",
    access_token: "old",
    refresh_token: "refresh",
    access_token_expires_at: new Date(Date.now() - 1000).toISOString()
  })

  global.fetch = originalFetch

  assert.equal(token, "new-access")
  assert.equal(db.calls.length, 1)
})
