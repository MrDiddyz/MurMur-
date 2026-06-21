# MURMUR SECURITY

MURMUR SECURITY is a mobile-first, installable PWA that analyzes pasted messages for common scam indicators and returns a deterministic risk score with clear reasoning and recommendations.

## What the app does

- Paste suspicious text and run a deterministic scam analysis.
- See:
  - risk level (`LOW`, `MEDIUM`, `HIGH`)
  - numeric score (`0-100`)
  - matched red-flag triggers
  - concise reasoning
  - recommended next action
- Save scans to local history using browser `localStorage`.
- Review, delete, or clear scan history on a dedicated screen.
- Work offline-first via service worker caching.

## Tech stack

- Next.js (App Router)
- TypeScript (strict mode)
- Tailwind CSS
- Local browser storage (`localStorage`) for v1
- PWA with web manifest + service worker

## Run locally

```bash
npm install
npm run dev
```

Open: `http://localhost:3000`

## Build for production

```bash
npm run build
npm run start
```

## Deploy to Vercel

1. Push this folder to a Git provider (GitHub/GitLab/Bitbucket).
2. Import the project into Vercel.
3. Framework preset: Next.js (auto-detected).
4. Build command: `npm run build` (default).
5. Output: Next.js default.

No database setup is required for v1.

## Project structure

```text
murmur-security/
├─ app/
│  ├─ history/page.tsx       # History screen
│  ├─ globals.css            # Global styles
│  ├─ layout.tsx             # App shell, metadata, nav
│  └─ page.tsx               # Scanner home screen
├─ components/
│  ├─ Badge.tsx
│  ├─ Button.tsx
│  ├─ Card.tsx
│  ├─ MessageTextarea.tsx
│  ├─ PwaRegister.tsx
│  └─ ResultCard.tsx
├─ lib/
│  ├─ analyze.ts             # Rule-based scam engine
│  └─ storage.ts             # localStorage persistence helpers
├─ public/
│  ├─ icons/
│  │  ├─ icon-192.svg
│  │  └─ icon-512.svg
│  ├─ manifest.json
│  └─ sw.js
├─ types/index.ts
└─ README.md
```

## How scam scoring works

`lib/analyze.ts` uses deterministic weighted rules:

- urgency language
- account suspension threats
- "reply with keyword" prompts
- suspicious verification wording
- generic greetings
- external-link pressure
- payment pressure
- credential/sensitive data requests
- short-message + emphasis modifiers

Each matched rule contributes points. Total score is clamped to 0–100 and mapped:

- `LOW`: 0–34
- `MEDIUM`: 35–69
- `HIGH`: 70–100

## Limitations of this rule-based detection

- It does not use ML/NLP context modeling.
- It can miss novel scam tactics that do not match current patterns.
- It can produce false positives when legitimate messages share scam-like language.
- Results should guide caution, not serve as legal/security certainty.

## PWA icon note

This repository includes SVG placeholder icons in `public/icons/` for immediate functionality.
For best iPhone home-screen quality, replace them with real PNG assets at 192x192 and 512x512 and update `manifest.json` accordingly.
