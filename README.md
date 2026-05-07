# MurMur Signal Audit Generator

A production-ready MVP for generating premium local-business signal audits with Next.js App Router, TypeScript, Tailwind CSS, shadcn-style UI components, Supabase auth/database, OpenAI generation, Vercel deployment, and browser-native PDF export.

## Features

- Apple-style black/gold landing experience
- Email/password authentication with Supabase
- Protected dashboard of saved audits
- Guided audit form for business name, website, industry, and notes
- OpenAI-powered audit generation API route
- Structured report sections:
  - Executive summary
  - Observations
  - Narrative diagnosis
  - Signal leaks
  - Recommendations
  - Visibility/trust/conversion/consistency score
  - 7-day action plan
- Row-level secured Supabase schema
- Print-to-PDF export optimized with print styles

## Tech stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- shadcn/ui-inspired local primitives
- Supabase Auth + Postgres + RLS
- OpenAI API
- Vercel

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment variables:

```bash
cp .env.example .env.local
```

3. Fill in `.env.local` with Supabase and OpenAI credentials.

4. Apply the database migration in Supabase SQL Editor or with Supabase CLI:

```bash
supabase db push
```

5. Run the app:

```bash
npm run dev
```

6. Open `http://localhost:3000`.

## Supabase setup

1. Create a Supabase project.
2. Enable Email authentication in **Authentication → Providers**.
3. Add local and production redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://your-vercel-domain.vercel.app/auth/callback`
4. Run `supabase/migrations/20260506000000_signal_audits.sql`.
5. Copy the project URL and anon key into `.env.local` and Vercel.

## OpenAI setup

Create an OpenAI API key and set:

```bash
OPENAI_API_KEY=sk-your-openai-key
OPENAI_MODEL=gpt-4o-mini
```

The generator route lives at `app/api/audits/generate/route.ts` and returns a saved audit id after validating and storing the structured JSON report.

## Deploy to Vercel

1. Import this repository into Vercel.
2. Set the environment variables from `.env.example`.
3. Ensure Supabase auth redirect URLs include the Vercel production domain.
4. Deploy.
5. Run a smoke test: sign up, create an audit, open the report, and click **Export PDF**.

## Project structure

```text
app/                    Next.js App Router pages and API routes
components/             shadcn-style UI primitives and app components
lib/                    Shared types, validation, utilities, Supabase clients
supabase/migrations/    Postgres schema, RLS policies, and indexes
.env.example            Required runtime variables
```

## Production notes

- RLS ensures users can only access their own audits.
- OpenAI JSON output is validated with Zod before persistence.
- PDF export uses native print styles to avoid heavyweight server PDF infrastructure in the MVP.
- For paid plans, add Stripe checkout and audit quotas before public launch.
