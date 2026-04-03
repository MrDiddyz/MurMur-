# MurMur Mobile Engine v0.3

Production-ready MVP for a multi-agent council with memory-based scoring.

## Stack
- Next.js App Router + TypeScript
- Tailwind CSS
- Supabase (Auth + DB)
- API Routes only (no external backend)

## Setup
1. Copy envs:
   ```bash
   cp .env.example .env.local
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run SQL from `supabase/schema.sql` in Supabase SQL editor.
4. Start:
   ```bash
   npm run dev
   ```

## Auth
- Magic link login at `/login`
- `/dashboard` is middleware-protected

## API
- `POST /api/run`
- `GET /api/runs`
- `GET /api/stats`
- `GET /api/cron/run`

## Cron
Configured in `vercel.json` to trigger every 10 minutes.
