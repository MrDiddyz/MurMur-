# MurMur Lipsync Engine — Architecture Verification + MVP Delivery Blueprint

## 1) Architecture Verification (Against Your Strict Stack + Rules)

The proposed MVP architecture is valid and production-ready for your stated constraints:

- **Frontend:** Next.js App Router + Tailwind CSS ✅
- **Backend:** Next.js Route Handlers (`app/api/**/route.ts`) ✅
- **Database/Auth/Storage/Realtime:** Supabase ✅
- **AI Providers:** ElevenLabs (TTS) + D-ID or HeyGen (lipsync) ✅
- **Deployment:** Vercel + Supabase ✅

### Security and data-boundary checks

- **Service role keys are server-only** (used only inside Route Handlers / server modules).
- **Every job row includes `user_id`** and is protected by RLS.
- **Storage object paths are namespaced by `user_id`**, e.g. `users/<user_id>/images/<job_id>.<ext>`.
- **Signed upload URL flow** is used so the client can upload directly to Supabase Storage without privileged credentials.
- **Realtime job updates** subscribe to user-scoped job changes.

### Operational viability checks

- Asynchronous, long-running generation is modeled as a **job state machine**:
  - `queued` → `voice_generating` → `lipsync_generating` → `completed` (or `failed`)
- External providers are wrapped in server-side adapters for provider swap/fallback.
- Cleanup path for user deletion/job deletion removes associated storage objects.

---

## 2) Final Folder Structure (Modular, Deployable)

```txt
apps/web/next-app/
  app/
    (auth)/
      login/page.tsx
      auth/callback/route.ts
    (dashboard)/
      dashboard/page.tsx
      jobs/[jobId]/page.tsx
      layout.tsx
    api/
      auth/
        logout/route.ts
      uploads/
        signed-url/route.ts
      jobs/
        route.ts                 # POST create job, GET list jobs
        [jobId]/route.ts         # GET detail, DELETE job + cleanup
        [jobId]/retry/route.ts   # optional
      generate/
        voice/route.ts           # internal/orchestrator step endpoint
        lipsync/route.ts         # internal/orchestrator step endpoint
      webhooks/
        did/route.ts             # if provider supports callbacks
        heygen/route.ts          # if provider supports callbacks
    globals.css
    layout.tsx

  components/
    dashboard/
      generator-panel.tsx
      jobs-table.tsx
      job-status-badge.tsx
    ui/
      button.tsx
      input.tsx
      textarea.tsx

  lib/
    env.ts
    types.ts
    constants.ts
    auth/
      guard.ts
    supabase/
      browser.ts
      server.ts
      admin.ts                 # service role, server-only
    storage/
      paths.ts
    jobs/
      status.ts
      mapper.ts
    realtime/
      jobs-channel.ts
    providers/
      elevenlabs.ts
      did.ts
      heygen.ts
    validation/
      jobs.ts
      uploads.ts

supabase/
  migrations/
    001_extensions.sql
    002_profiles.sql
    003_jobs.sql
    004_job_events.sql
    005_storage_policies.sql
    006_rls.sql
  seed.sql
```

### Suggested data model (MVP)

- `profiles (user_id pk, created_at, updated_at)`
- `jobs (
    id uuid pk,
    user_id uuid not null,
    script text not null,
    image_path text not null,
    voice_path text,
    video_path text,
    provider_tts text not null default 'elevenlabs',
    provider_lipsync text not null default 'did',
    status text not null,
    error_message text,
    created_at timestamptz,
    updated_at timestamptz
  )`
- `job_events (
    id bigint generated,
    job_id uuid,
    user_id uuid,
    event_type text,
    payload jsonb,
    created_at timestamptz
  )`

---

## 3) Core API Routes (MVP Contract)

All routes assume authenticated user context from Supabase Auth cookie/session.

### Auth

- `POST /api/auth/logout`
  - invalidates session and redirects to login.

### Upload flow

- `POST /api/uploads/signed-url`
  - input: `{ fileName: string, contentType: string }`
  - output: `{ signedUrl: string, path: string, expiresIn: number }`
  - behavior:
    - builds path `users/<user_id>/images/<uuid>-<safeFileName>`
    - returns signed upload URL for direct client upload.

### Jobs

- `POST /api/jobs`
  - input: `{ script: string, imagePath: string, lipsyncProvider?: 'did' | 'heygen' }`
  - output: `{ jobId: string, status: 'queued' }`
  - behavior:
    1. insert user-bound job row
    2. enqueue generation pipeline (or trigger background step)
    3. return optimistic job response

- `GET /api/jobs`
  - query: `?limit=20&cursor=<iso_or_id>`
  - output: paginated jobs for current `user_id`.

- `GET /api/jobs/:jobId`
  - output: full job details + media URLs (signed if private).

- `DELETE /api/jobs/:jobId`
  - behavior:
    1. verify ownership
    2. delete storage objects (`image_path`, `voice_path`, `video_path`)
    3. delete job/events rows
  - output: `{ ok: true }`

### Internal orchestration routes (server-to-server)

- `POST /api/generate/voice`
  - input: `{ jobId: string }`
  - behavior:
    - fetch job, call ElevenLabs, store `voice_path`, set status `voice_ready`.

- `POST /api/generate/lipsync`
  - input: `{ jobId: string }`
  - behavior:
    - call D-ID or HeyGen with image + audio
    - poll/webhook complete
    - store `video_path`, set status `completed`.

### Optional provider callbacks

- `POST /api/webhooks/did`
- `POST /api/webhooks/heygen`
  - verify provider signature
  - map external job status → internal status
  - update `jobs` and append `job_events`.

---

## 4) Environment Setup (MVP)

Create `.env.local` in `apps/web/next-app`:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

ELEVENLABS_API_KEY=
DID_API_KEY=
HEYGEN_API_KEY=

APP_URL=http://localhost:3000
CRON_SECRET=
```

### Notes

- Never expose `SUPABASE_SERVICE_ROLE_KEY` in client bundles.
- Keep only one lipsync provider enabled at first release for operational simplicity.
- If using scheduled workers/cron for retries, protect endpoint with `CRON_SECRET`.

---

## 5) Deployment Checklist (Vercel + Supabase)

### Supabase

1. Create project and region near primary users.
2. Apply SQL migrations for tables, indexes, and RLS.
3. Create storage buckets:
   - `images` (private)
   - `audio` (private)
   - `videos` (private)
4. Add storage policies enforcing `auth.uid()` path ownership.
5. Enable Realtime on `jobs` table.
6. Configure magic link auth and redirect URLs.

### Vercel

1. Import repo and select `apps/web/next-app` as root (if monorepo setup requires).
2. Set all environment variables for Production + Preview.
3. Ensure server routes run in Node runtime when needed (provider SDK compatibility).
4. Configure custom domain and HTTPS.
5. Add cron/scheduled trigger only if using pull/poll job progression.

### Provider setup

1. ElevenLabs API key with usage limits and alerting.
2. D-ID or HeyGen API key and webhook URL configured.
3. Provider webhook signatures validated server-side.

### Production hardening

1. Add request rate limits on generation routes.
2. Add idempotency key on `POST /api/jobs`.
3. Add retry policy with capped attempts and dead-letter status.
4. Add structured logging and trace IDs per job.
5. Add budget guardrails (max script length / duration caps).

---

## 6) Known Risks + Improvements

### Risks

- AI provider latency spikes can delay user-visible completion.
- Provider failures can leave jobs stuck if no watchdog/retry loop exists.
- Storage growth can increase costs without lifecycle rules.
- Realtime channels can get noisy at scale without scoped subscriptions.

### Improvements (post-MVP)

- Introduce queue worker (e.g., separate processor) for stronger reliability.
- Add provider failover (D-ID ↔ HeyGen) per job policy.
- Add usage metering + quotas per plan.
- Add watermarking/branding pipeline.
- Add signed short-lived download URLs and optional CDN fronting.

---

## Immediate Next Build Slice

1. Implement SQL migrations + RLS first.
2. Implement `/api/uploads/signed-url` and `/api/jobs`.
3. Implement dashboard optimistic job creation + realtime status updates.
4. Implement provider adapters and end-to-end generation path.
5. Implement delete + cleanup path and observability events.
