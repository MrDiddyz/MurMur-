# MurMur Security

MurMur Security is a **mobile-first Next.js + TypeScript + Tailwind PWA** for analyzing suspicious messages (SMS, chat, email text) and scoring likely scam risk.

## Features

- Scam-message analysis with explainable flags and recommended actions.
- Risk scoring output (`low`, `medium`, `high`) with a 0–100 score.
- Persistent local history saved in `localStorage` (browser-only, privacy-friendly).
- Mobile-first single-page UI optimized for quick triage.
- Progressive Web App setup:
  - Web manifest (`/public/manifest.webmanifest`)
  - Service worker (`/public/sw.js`)
  - Offline fallback page (`/public/offline.html`)
  - Installable app metadata and icons.

## Tech stack

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS

## Getting started

```bash
npm install
npm run dev
```

Open <http://localhost:3000>.

## Build and run production

```bash
npm run build
npm run start
```

## Project structure

```text
murmur-security/
├─ app/
│  ├─ globals.css
│  ├─ layout.tsx
│  └─ page.tsx
├─ components/
│  └─ ServiceWorkerRegister.tsx
├─ lib/
│  └─ analyzer.ts
├─ public/
│  ├─ icons/
│  │  ├─ icon-192.svg
│  │  └─ icon-512.svg
│  ├─ manifest.webmanifest
│  ├─ offline.html
│  └─ sw.js
└─ README.md
```

## Notes

- Analysis is pattern-based and intended for quick safety checks; it is not legal or forensic advice.
- History is kept only in the current browser's local storage under key `murmur-security-history-v1`.
- The app requires JavaScript for full functionality (analysis + history persistence).
