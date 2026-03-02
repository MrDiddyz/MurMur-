# MurMur Stronghold Services

## TikTok Direct Publish Flow

```mermaid
flowchart TD
  A[POST /posts/create] --> B[Insert posts row status=queued]
  B --> C[enqueue publish_post job]
  C --> D[publish worker loads post + OAuth token]
  D --> E{token expired?}
  E -- yes --> F[refresh token]
  E -- no --> G[init direct publish]
  F --> G
  G --> H[upload video to upload_url]
  H --> I[save tiktok_publish_id]
  I --> J[set status=processing]
  J --> K[enqueue poll_status job]
  K --> L[status endpoint]
  L --> M{PROCESSING/PUBLISHED/FAILED}
  M -- PROCESSING --> N[retry with exponential backoff]
  M -- PUBLISHED --> O[set status=published]
  M -- FAILED --> P[set status=failed + error_message]
```

## Job Lifecycle

1. `publish_post`
   - attempts: 5
   - exponential backoff
   - transitions post status `queued -> uploading -> processing`
2. `poll_status`
   - attempts from `PUBLISH_STATUS_MAX_ATTEMPTS` (default 5)
   - retries every 30 seconds with exponential backoff while TikTok returns `PROCESSING`
   - final status transition to `published` or `failed`

## Error Handling

- No raw OAuth tokens are logged.
- All worker exceptions write minimal error messages to `posts.error_message`.
- Failed jobs leave posts in `failed` state for operator visibility.
