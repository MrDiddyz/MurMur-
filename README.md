# MurMur Auto Bot v0.4

MurMur Auto Bot v0.4 is a production-minded monorepo for generating, rendering, scoring, and exporting short-form MurMur-style videos.

## Stack
- **Dashboard:** Next.js App Router + TypeScript (`apps/dashboard`)
- **Services:** Python workers (`services/*`)
- **Database/Storage:** Supabase (`packages/db` + `supabase/migrations`)
- **AI:** OpenAI for script/image prompt/TTS generation
- **Automation:** GitHub Actions schedules (`.github/workflows`)

## Monorepo Layout
```txt
apps/
  dashboard/
services/
  worker/      # script + image prompt + tts + mp4 render + video insert
  ingest/      # metrics ingest (placeholder data source)
  optimizer/   # weighted score + hook/variation selection + AB pair creation
  post/        # Instagram request structure + YouTube stub + TikTok/CapCut semimanual notice
  export/      # JSON export manifests
  voice/       # standalone TTS utility
  common/      # shared clients and config
packages/
  db/          # Supabase client + dashboard queries
supabase/
  migrations/  # SQL schema and RPC functions
.github/workflows/
  build-test.yml
  scheduled-generation.yml
  scheduled-ingest.yml
```

## Automation boundaries
- ✅ **Automatic now**
  - Generate scripts/voice/prompts
  - Render MP4 (when `ffmpeg` is available)
  - Save records to Supabase
  - Compute weighted scores
  - Create A/B records
- ⚠️ **Semimanual / export-first by design in v0.4**
  - TikTok posting
  - CapCut publishing
- ⚠️ **API-ready but not full autopost in this repo**
  - Instagram Reels request structure is implemented
  - YouTube Shorts upload is a clearly marked stub

## Data model
Main tables created by migration:
- `videos`
- `metrics`
- `daily_stats`
- `ab_tests`

RPC functions for dashboard:
- `hook_performance()`
- `variation_performance()`

## Local setup
1. Install dependencies
   ```bash
   pnpm install
   pip install -r services/requirements.txt
   ```
2. Configure env
   ```bash
   cp .env.example .env
   # fill keys
   ```
3. Apply Supabase migration
   ```bash
   # Run SQL in Supabase SQL editor
   supabase/migrations/20260403_murmur_autobot_v04.sql
   ```

## Run locally (first commands)
```bash
# 1) Dashboard
pnpm --filter dashboard dev

# 2) Generate new content batch
python -m services.worker.main

# 3) Ingest metrics
python -m services.ingest.main

# 4) Optimize and choose winners
python -m services.optimizer.main

# 5) Produce export JSON
python -m services.export.main
```

## Dashboard sections
- Top videos by score
- Recent generations
- Hook performance
- Variation performance
- A/B winners

## CI/CD
- `build-test.yml`: builds dashboard + compiles Python services
- `scheduled-generation.yml`: daily generation run
- `scheduled-ingest.yml`: daily ingest + optimizer run
