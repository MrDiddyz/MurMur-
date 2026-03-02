import { publishQueue } from "./queue.js"
import * as tiktokService from "./tiktok-service.js"

function toMinimalError(error) {
  if (typeof error?.message === "string") {
    return error.message.slice(0, 200)
  }
  return "unknown_error"
}

export async function handlePublishPostJob(job, { db, queue = publishQueue, services = tiktokService }) {
  const { postId } = job.data

  try {
    const postResult = await db.query(
      `SELECT p.id, p.account_id, p.caption, p.video_url,
              t.account_id AS token_account_id,
              t.access_token, t.refresh_token, t.access_token_expires_at
         FROM posts p
         JOIN tiktok_oauth_tokens t ON t.account_id = p.account_id
        WHERE p.id = $1`,
      [postId]
    )

    if (postResult.rowCount === 0) {
      throw new Error("post_or_token_not_found")
    }

    const post = postResult.rows[0]

    await db.query("UPDATE posts SET status='uploading', updated_at=NOW() WHERE id=$1", [postId])

    const accessToken = await services.ensureAccessToken(db, post)

    const init = await services.initDirectVideoPublish({
      accessToken,
      caption: post.caption,
      videoUrl: post.video_url
    })

    await services.uploadVideo(init.uploadUrl, post.video_url)

    await db.query(
      `UPDATE posts
          SET tiktok_publish_id=$1,
              status='processing',
              error_message=NULL,
              updated_at=NOW()
        WHERE id=$2`,
      [init.publishId, postId]
    )

    await queue.add(
      "poll_status",
      { postId, publishId: init.publishId },
      {
        attempts: Number(process.env.PUBLISH_STATUS_MAX_ATTEMPTS || 5),
        backoff: { type: "exponential", delay: 30_000 }
      }
    )
  } catch (error) {
    await db.query(
      "UPDATE posts SET status='failed', error_message=$1, updated_at=NOW() WHERE id=$2",
      [toMinimalError(error), postId]
    )
    throw error
  }
}

export async function handlePollStatusJob(job, { db, services = tiktokService }) {
  const { postId, publishId } = job.data

  const row = await db.query(
    `SELECT t.access_token, t.refresh_token, t.access_token_expires_at, t.account_id
       FROM posts p
       JOIN tiktok_oauth_tokens t ON p.account_id = t.account_id
      WHERE p.id=$1`,
    [postId]
  )

  if (row.rowCount === 0) {
    throw new Error("post_or_token_not_found")
  }

  const token = row.rows[0]
  const accessToken = await services.ensureAccessToken(db, token)
  const statusResponse = await services.getPublishStatus({ accessToken, publishId })

  if (statusResponse.status === "PROCESSING") {
    throw new Error("publish_processing")
  }

  if (statusResponse.status === "PUBLISHED") {
    await db.query(
      "UPDATE posts SET status='published', error_message=NULL, updated_at=NOW() WHERE id=$1",
      [postId]
    )
    return
  }

  await db.query(
    "UPDATE posts SET status='failed', error_message=$1, updated_at=NOW() WHERE id=$2",
    [statusResponse.errorMessage || "publish_failed", postId]
  )
}
