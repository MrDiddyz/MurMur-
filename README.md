# MurMur (Next.js App Router, TypeScript-first)

This repository is prepared for structured MVP development with a minimal, modular layout.

## Target structure

- `app/` — Next.js App Router routes and layouts
- `components/` — reusable UI components
- `lib/` — server/client utilities, domain logic, helpers
- `contracts/` — smart contract sources, ABIs, and contract-related types
- `public/` — static assets

> Note: Existing legacy code still lives in `src/` and continues to work. New MVP work should be added to the root folders above.

## Tech stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Scripts

- `npm run dev` — run the development server
- `npm run build` — production build
- `npm run start` — run the production server
- `npm run lint` — Next.js lint
- `npm run typecheck` — TypeScript type check

## Environment variables

Copy the template and fill values locally:

```bash
cp .env.example .env.local
```

Do **not** expose secrets in client-side code (`NEXT_PUBLIC_*` is public).
