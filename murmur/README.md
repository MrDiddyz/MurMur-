# murmur-marketing-ai-v2 (Phase 2)

Phase 2 introduces real persistence, Supabase auth foundations, analytics storage, and a dashboard wired to API data.

## Required environment variables

Copy `.env.example` to `.env` and set:

- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only secret)
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_API_URL` (defaults to `http://localhost:3001/v1`)

## Supabase setup

1. Create a Supabase project.
2. Pull your project URL and keys from **Project Settings → API**.
3. Set all required env vars.
4. Ensure your local API uses the service role key only on server-side processes.

## Run migrations

```bash
supabase db push
```

This applies all SQL in `supabase/migrations`, including Phase 2 tables:
`artists`, `releases`, `campaigns`, `content_packs`, `playlist_targets`,
`analytics_snapshots`, and `scheduled_jobs`.

## Seed development data

```bash
pnpm seed
```

This creates:
- 1 artist
- 1 release
- 1 campaign
- sample content packs
- sample analytics snapshots

## Run locally

Install dependencies:

```bash
pnpm install
```

Start API and dashboard together:

```bash
pnpm dev
```

- Dashboard: `http://localhost:3000`
- API: `http://localhost:3001`

## Notes

- External connectors (Spotify/TikTok publish integrations) are intentionally left as future connectors.
- Scheduler support currently provides typed job creation primitives for future cron/queue orchestration.
