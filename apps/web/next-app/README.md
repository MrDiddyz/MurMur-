# Next App Area

This folder contains the isolated Next.js-oriented code moved out of `apps/web/src`.

Structure:

- `app/`: Next App Router routes and handlers
- `components/`: UI/components used by Next routes
- `lib/`: Next/server-side helpers and domain helpers
- `data/`: Next route content data
- `murmurlayer/`: Next route feature module
- `styles/`: Next-only stylesheet assets

This separation keeps Vite deployment builds focused on `apps/web/src/main.tsx` and `apps/web/src/App.tsx`.
