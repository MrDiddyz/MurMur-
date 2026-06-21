# murmur-marketing-ai-v2

A production-ready Turborepo monorepo starter for an AI music marketing platform.

## What this includes

- **Release planning** via agent stub (`releasePlanner`)
- **Content generation** via agent stub (`contentGenerator`)
- **Playlist intelligence** via agent stub (`playlistHunter`)
- **Social publishing prep** with explicit human-review disclaimers
- **Analytics foundation** via agent stub (`analyticsBrain`)
- **Dashboard UI** with home and campaigns pages in Next.js

> Current Spotify, TikTok, and Supabase integrations are placeholders only.

## Workspace layout

```txt
apps/
  api/         Express API with /api/health and /api/campaigns
  dashboard/   Next.js dashboard app
packages/
  agents/      AI agent stubs
  engine/      campaignOrchestrator
  types/       shared contracts
  config/      runtime/env loader
```

## Prerequisites

- Node.js 20+
- pnpm 9+

## Setup

1. Copy env values:

   ```bash
   cp .env.example .env
   ```

2. Install dependencies:

   ```bash
   pnpm install
   ```

3. Run all apps/packages in dev mode:

   ```bash
   pnpm dev
   ```

## Useful scripts

- `pnpm dev` - run all dev targets via Turbo
- `pnpm build` - build all packages/apps
- `pnpm lint` - lint checks (TypeScript/Next lint targets)
- `pnpm typecheck` - strict TypeScript validation

## API routes

- `GET /api/health`
- `POST /api/campaigns`

Example payload for `/api/campaigns`:

```json
{
  "name": "Echo Drive",
  "budgetUSD": 3000,
  "primaryGenre": "alt-pop",
  "channels": [
    { "name": "spotify", "objective": "playlist placements", "cadencePerWeek": 2 },
    { "name": "tiktok", "objective": "short-form momentum", "cadencePerWeek": 4 }
  ],
  "releasePlan": {
    "title": "Echo Drive",
    "artistName": "Nova Lane",
    "releaseDateISO": "2026-03-12",
    "goals": ["100k streams", "20 playlist adds"],
    "timeline": [
      { "weekOffset": -4, "milestone": "launch pre-save", "owner": "manager" },
      { "weekOffset": -1, "milestone": "creator teaser push", "owner": "artist" },
      { "weekOffset": 0, "milestone": "release day pulse", "owner": "platform" }
    ]
  }
}
```
