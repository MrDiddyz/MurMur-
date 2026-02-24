# MURMUR : A Learning Constellation

Production-ready marketing website for MURMUR, built with Next.js (App Router), TypeScript, and Tailwind CSS.

## Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Server Actions for contact form handling
- SEO metadata + sitemap + robots


## Nix development shell
If you use Nix, this repo now includes a `flake.nix` for a reproducible dev environment.

```bash
nix develop
```

The shell provides:
- Node.js 20
- Python 3.10

## Run locally
```bash
npm install
npm run dev
```
Open `http://localhost:3000`.

## Quality checks
```bash
npm run lint
npm run typecheck
npm run build
```

## Deploy (Vercel recommended)
1. Push repository to GitHub.
2. Import project in Vercel.
3. Framework preset: **Next.js**.
4. Build command: `npm run build`.
5. Start command: `npm run start`.

## Editing modules content
All module content lives in:
- `src/data/modules.ts`

Update/add module objects there (`slug`, category, outcomes, timeline, `priceFrom`).
Dynamic detail routes (`/modules/[slug]`) and sitemap generation pick this data automatically.

## Contact form storage
Contact submissions are stored locally (JSON) at:
- `modules/contact-submissions.json`

For production, replace this with a proper database or secure CRM integration.

## Analytics placeholder
A production-only placeholder script is included in:
- `src/components/analytics-placeholder.tsx`

Replace with your analytics provider snippet (e.g., Plausible, PostHog, GA4), and set any required env vars.

## Safety and wellbeing disclaimer
Wellbeing pages are explicitly non-clinical and non-diagnostic.
- No medical advice, diagnosis, or treatment is offered.
- Crisis guidance directs users to local emergency services and helplines.
- Disclaimer appears in wellbeing and legal pages.

## Modular realtime-learning backend (MurMur core)
The Python orchestrator now runs a modular AI loop with persistent learning and logging:
- `modules/listener.py`: extracts intent/signals with deterministic rule-based parsing.
- `modules/spectre.py`: drives Spectre mode planning for a niche side-income workflow.
- `modules/synthesizer.py`: composes end-user response in selected tone.
- `modules/memory.py`: updates runtime state and appends JSONL logs for each interaction.

Generated runtime files:
- `modules/runtime-state.json`
- `modules/runtime-log.jsonl`

API endpoint for live mapping/state:
- `GET /state`


Default response tone in API is now `knivskarp` for concise execution-focused output.
