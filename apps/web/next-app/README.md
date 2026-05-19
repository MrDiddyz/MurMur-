# Murmur Learning Lab (MVP)

A minimal, production-ready learning and reflection lab.

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- Supabase (Postgres via REST API)

## Core flow

1. User writes a reflection on `/reflection`.
2. AI response is generated with:
   - mirror
   - insight
   - next step
   - creative suggestion
3. Reflection is saved to Supabase (`public.reflections`).
4. Learning node is created from the reflection (`public.learning_nodes`).
5. Dashboard (`/`) shows recent reflections and nodes.

## Routes

- `/` Dashboard
- `/reflection` Reflection input
- `/constellation` Learning nodes list
- `/review` Reflection response review

## Required environment variables

Set these in `.env.local`:

```bash
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## Database schema

Apply `supabase/schema.sql` to your Supabase project.  
MVP tables used by this app:

- `public.reflections`
- `public.learning_nodes`

## Local development

```bash
npm install
npm run dev
```

## Verification

```bash
npm run lint
npm run typecheck
npm run build
```
