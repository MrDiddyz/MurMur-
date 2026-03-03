# MurMur Billing Service

## TikTok Webhook Receiver

This service exposes a signed TikTok webhook endpoint:

- `POST /webhooks/tiktok`
- `GET /webhooks/tiktok/health`

### Verification flow

1. TikTok sends the webhook with:
   - `X-Tt-Signature`
   - `X-Tt-Timestamp`
2. The API reads the raw request body (buffer) and verifies the signature with `HMAC-SHA256` using:
   - `TIKTOK_WEBHOOK_SECRET`
3. The request is rejected with `401` when:
   - signature is missing
   - timestamp is invalid or older than 5 minutes
   - signature does not match

### Replay protection and idempotency

The service stores every processed event in `webhook_events`:

- `event_id` (PK)
- `received_at`
- `payload` (`jsonb`)

Duplicate `event_id` values are ignored safely.

### Publish status processing

For `event.type = publish.status_change`:

- lookup by `posts.tiktok_publish_id`
- update post status
- store TikTok error message in `posts.error_message` when present

### Environment variables

Set these values before running the service:

```bash
TIKTOK_WEBHOOK_SECRET=replace-with-strong-random-secret
DATABASE_URL=postgres://...
REDIS_HOST=redis
```

## TikTok Developer Portal configuration

In your TikTok app settings:

1. Open **Webhooks** configuration.
2. Set callback URL to:
   - `https://<your-domain>/webhooks/tiktok`
3. Configure the signing secret to match `TIKTOK_WEBHOOK_SECRET`.
4. Subscribe to the publish status event type (`publish.status_change`).
5. Save and trigger a test event.
6. Verify health endpoint:

```bash
curl https://<your-domain>/webhooks/tiktok/health
```

Expected response:

```json
{"ok":true}
```
