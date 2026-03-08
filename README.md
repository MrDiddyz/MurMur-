# MurMur Base Stack

Minimal 1-server skeleton with FastAPI + Postgres + Nginx using Docker Compose.

## Run

1. Copy environment file:
   ```bash
   cp .env.example .env
   ```
2. Build and start services:
   ```bash
   docker compose up -d --build
   ```
3. Check health endpoint via Nginx:
   ```bash
   curl http://localhost/health
   ```

## Next.js + Supabase connection

The Next.js app is wired for Supabase using environment variables and a server-side REST helper.

### Environment variables

Add these values to your `.env.local` (or deployment environment):

```bash
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key> # optional, server-only
```

### Included wiring

- `src/lib/supabase/env.ts`
  - validates required env values
  - normalizes `NEXT_PUBLIC_SUPABASE_URL` to a stable origin
  - caches parsed config for reuse
- `src/lib/supabase/rest.ts`
  - reusable helper for Supabase REST calls from server code
  - supports query/body/method overrides
  - includes timeout + retry support for better reliability
  - safely handles empty (`204`) and non-JSON responses
- `src/app/api/supabase/health/route.ts`
  - `GET /api/supabase/health`
  - retries transient failures once
  - returns latency data for basic diagnostics

### Quick verification

Start the app and call:

```bash
curl http://localhost:3000/api/supabase/health
```

Expected response:

```json
{ "ok": true, "latencyMs": 42 }
```
