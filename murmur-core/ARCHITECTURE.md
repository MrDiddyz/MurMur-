# MurMur Core Architecture

Input → scanner → agents → score → report → dashboard.

- `apps/web`: Next.js 15 App Router UI/API.
- `agents`: deterministic business logic engines.
- `packages`: shared types/scoring/prompts/UI primitives.
- `database`: Supabase-ready schema and policies.
- `reports`: markdown templates and demos.
- `archive`: raw/cleaned/decoded fragment storage.
- `docs`: brand and operational doctrine.
