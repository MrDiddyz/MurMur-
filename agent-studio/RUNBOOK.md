# Agent Studio Runbook

## 1) Create Supabase project
1. Go to https://supabase.com and create a new project.
2. In **Authentication > Providers > Email**, enable email auth and magic link.

## 2) Apply schema
1. Open **SQL Editor**.
2. Paste `supabase/schema.sql` and run it.

## 3) Configure environment
```bash
cp .env.local.example .env.local
```
Fill in:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL` (usually `http://localhost:3000`)

## 4) Install and run
```bash
npm install
npm run dev
```
Open http://localhost:3000.

## 5) Verification flow
1. Visit `/login`, submit email, open magic link.
2. Confirm redirect to `/dashboard`.
3. Confirm auto-created workspace + default settings exist.
4. Go to `/scenarios`, create a scenario.
5. Open scenario detail and click **Kjør run**.
6. Confirm run appears with deterministic proposals.
7. Click **Save baseline** and verify at `/baselines`.
8. Go to `/settings`, update weights/temperature, save.

## Useful checks
```bash
npm run build
```
