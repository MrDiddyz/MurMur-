# MurMur

A minimal Next.js starter for a signal, council, and reflection workspace.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase client helpers
- Vercel-ready project configuration

## Getting started

```bash
npm install
npm run setup
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment

Copy `.env.example` to `.env.local` and set:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

`SUPABASE_SERVICE_ROLE_KEY` is only used in server-side code. Never expose it to client components.

## Supabase

Run `supabase/schema.sql` in your Supabase SQL editor to create the `reflections` table used by `/api/reflection/save`.

## Scripts

```bash
npm run dev        # start the local app
npm run build      # create a production build
npm run start      # run the production build
npm run typecheck  # run TypeScript checks
npm run lint       # run Next.js linting
```

## Deploy to Vercel

1. Import this repository in Vercel.
2. Add the environment variables from `.env.example`.
3. Deploy with the included `vercel.json` settings.
