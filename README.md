# MurMur

MurMur is a production-ready starter for an AI creator platform where users can:

- Generate art or music with AI
- Publish works to a creator profile
- Sell digital works

## Stack

- **Frontend:** Next.js 14 + TypeScript + Tailwind CSS
- **Backend:** Vercel Serverless Functions (`/api`)
- **Database:** Supabase Postgres
- **Storage:** Supabase Storage

## Project Structure

```text
.
├── app/                  # Next.js App Router pages
├── components/           # Shared UI components
├── lib/                  # Utilities, env, Supabase clients, types
├── api/                  # Vercel serverless functions
├── styles/               # Global styles
├── public/               # Static assets
├── package.json
├── tsconfig.json
├── tailwind.config.js
├── postcss.config.mjs
├── next.config.mjs
├── .env.example
└── README.md
```

## Quick Start

1. Install dependencies:
   ```bash
   npm install
   ```
2. Copy env vars:
   ```bash
   cp .env.example .env.local
   ```
3. Run locally:
   ```bash
   npm run dev
   ```

## Supabase Setup

Create the `works` table:

```sql
create table if not exists public.works (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  kind text not null check (kind in ('image', 'music')),
  description text,
  file_path text not null,
  price_cents integer not null default 0,
  is_published boolean not null default false,
  creator_id uuid not null,
  created_at timestamptz not null default now()
);
```

Create a storage bucket (e.g. `works`) and apply row-level security policies as needed for your auth model.

## API Endpoints

- `POST /api/generate` — receives generation requests (image/music)
- `POST /api/publish` — updates publish status for a work in Supabase
- `POST /api/checkout` — returns placeholder checkout URL to integrate payment provider

## Production Notes

- Use Supabase RLS for all creator-owned data.
- Replace stub logic in `/api/generate.ts` and `/api/checkout.ts` with your AI and payments providers.
- Add observability (Vercel logs, Sentry, analytics) before launch.
