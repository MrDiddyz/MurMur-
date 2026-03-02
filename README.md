# MurMur TikTok Automation Platform

## Architecture diagram (text)

```
Client/API consumer
    |
    v
[Express API :4000] ---> [PostgreSQL]
    |
    +--> [BullMQ Queues on Redis] ---> [Worker Service]
                                      |
                                      v
                               [TikTok Service Modules]
```

## Services and folders

- `apps/api`: Express API with health, integration, and post endpoints.
- `apps/worker`: Background job workers for publish/status/token-refresh jobs.
- `apps/web`: Placeholder for future frontend.
- `services/tiktok`: TikTok OAuth/posting/creator/webhook scaffolds.
- `services/authz`: RBAC/ABAC utility modules.
- `services/audit`: Audit logging helper.
- `database/migrations`: SQL schema migrations.
- `shared`: DB, queue, config, and type helpers.

## Local setup

1. Copy env values:
   ```bash
   cp .env.example .env
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run migration:
   ```bash
   npm run migrate
   ```
4. Start API:
   ```bash
   npm run dev:api
   ```
5. Start worker:
   ```bash
   npm run dev:worker
   ```

## Environment variables

- `NODE_ENV` - `development|test|production`
- `API_PORT` - API bind port (default `4000`)
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `TIKTOK_CLIENT_ID` - TikTok app client id
- `TIKTOK_CLIENT_SECRET` - TikTok app secret
- `TIKTOK_REDIRECT_URI` - OAuth redirect URI

## Docker usage

```bash
docker compose -f docker/docker-compose.yml up --build
```

This command starts:
- API container on port `4000`
- Worker container
- PostgreSQL
- Redis

The compose file uses service-to-service URLs (e.g. `postgres`, `redis`) and health checks to reduce startup race conditions.

## Queue overview

BullMQ queues (`shared/queue.ts`):
- `publish_post` - publish jobs for created posts
- `poll_status` - polling publish status
- `refresh_token` - token refresh background tasks

## TikTok integration overview

TikTok service modules are scaffolded (signatures only):
- OAuth code exchange
- Access token refresh
- Video upload
- Publish status polling
- Creator info retrieval
- Webhook signature verification

## Security & reliability baseline

- Environment variables validated at boot (`shared/config.ts`).
- Request payload validation via Zod in API routes.
- Error middleware avoids leaking internals.
- Audit logging for integration and post actions.
- DB transactions for post creation flow.
- Worker failure path marks publish jobs as failed in DB.
- Graceful shutdown for API and worker on SIGINT/SIGTERM.
- No secrets are intentionally logged.
