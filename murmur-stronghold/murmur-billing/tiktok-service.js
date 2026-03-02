const TIKTOK_API_BASE = "https://open.tiktokapis.com/v2"

function tokenExpired(expiresAt) {
  if (!expiresAt) return false
  return new Date(expiresAt).getTime() <= Date.now() + 60_000
}

export async function refreshAccessToken(refreshToken) {
  const response = await fetch(`${TIKTOK_API_BASE}/oauth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_key: process.env.TIKTOK_CLIENT_KEY,
      client_secret: process.env.TIKTOK_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refreshToken
    })
  })

  if (!response.ok) {
    throw new Error("token_refresh_failed")
  }

  const payload = await response.json()
  return {
    accessToken: payload.access_token,
    refreshToken: payload.refresh_token,
    expiresIn: payload.expires_in
  }
}

export async function ensureAccessToken(db, tokenRow) {
  if (!tokenExpired(tokenRow.access_token_expires_at)) {
    return tokenRow.access_token
  }

  const refreshed = await refreshAccessToken(tokenRow.refresh_token)
  const expiresAt = new Date(Date.now() + refreshed.expiresIn * 1000)

  await db.query(
    `UPDATE tiktok_oauth_tokens
       SET access_token=$1,
           refresh_token=$2,
           access_token_expires_at=$3,
           updated_at=NOW()
     WHERE account_id=$4`,
    [refreshed.accessToken, refreshed.refreshToken, expiresAt.toISOString(), tokenRow.account_id]
  )

  return refreshed.accessToken
}

export async function initDirectVideoPublish({ accessToken, caption, videoUrl }) {
  const response = await fetch(`${TIKTOK_API_BASE}/post/publish/video/init/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      post_info: {
        title: caption
      },
      source_info: {
        source: "PULL_FROM_URL",
        video_url: videoUrl
      }
    })
  })

  if (!response.ok) {
    throw new Error("publish_init_failed")
  }

  const payload = await response.json()
  return {
    publishId: payload?.data?.publish_id,
    uploadUrl: payload?.data?.upload_url
  }
}

export async function uploadVideo(uploadUrl, videoUrl) {
  const source = await fetch(videoUrl)
  if (!source.ok) throw new Error("video_download_failed")

  const upload = await fetch(uploadUrl, {
    method: "PUT",
    headers: {
      "Content-Type": "video/mp4"
    },
    body: source.body
  })

  if (!upload.ok) {
    throw new Error("video_upload_failed")
  }
}

export async function getPublishStatus({ accessToken, publishId }) {
  const response = await fetch(`${TIKTOK_API_BASE}/post/publish/status/`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ publish_id: publishId })
  })

  if (!response.ok) {
    throw new Error("publish_status_failed")
  }

  const payload = await response.json()
  return {
    status: payload?.data?.status,
    errorMessage: payload?.data?.error_message || null
  }
}
