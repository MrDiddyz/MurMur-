# MurMur Core

**Not noise. Signal.**

MurMur Core is a premium AI-assisted intelligence MVP for decoding fragments, narratives, and local growth opportunities.

## Why it exists
Founders drown in notes, chats, and weak signals. MurMur converts raw archive into audit-ready execution signals.

## Tech stack
- Next.js 15 + TypeScript + Tailwind
- Zustand + Zod
- Turborepo monorepo
- Supabase-ready SQL (local mock fallback)

## Features
- Narrative Decode
- Signal Audit
- Council Scoring (Trend/Market/Tech/Revenue/Execution)
- Markdown report generation
- Dashboard with recent runs and KPIs

## Local setup
```bash
pnpm install
pnpm dev
```

## Env vars
Copy `.env.example` to `.env.local`.

## API routes
- `POST /api/decode/run`
- `POST /api/audit/run`
- `POST /api/council/run`
- `POST /api/reports/generate`

## Deployment (Vercel)
1. Import repo to Vercel.
2. Set root to `apps/web`.
3. Add env vars.
4. Deploy.

## Supabase future setup
SQL is prebuilt in `database/`. Switch storage adapter from mock store to Supabase repository layer.
