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

## Initialize bandit policy (Supabase Edge Function)

Use the helper script to call:
`POST https://<project>.functions.supabase.co/bandit-policy/init`

```bash
# dry run
scripts/init_bandit_policy.sh --project <project-ref> --dry-run

# execute
scripts/init_bandit_policy.sh --project <project-ref> \
  --agent-id PAPI \
  --arms swing_05,swing_08,swing_11
```

Optional auth token (for protected functions):
```bash
scripts/init_bandit_policy.sh --project <project-ref> --token "$SUPABASE_SERVICE_ROLE_KEY"
```
