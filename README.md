# MurMur

TypeScript-first Next.js (App Router) starter structure for structured MVP development.

## Stack
- Next.js 14 (App Router)
- React 18
- TypeScript
- Tailwind CSS

## Project Structure

```text
app/          # App Router pages, layouts, global styles
components/   # Reusable UI and feature components
lib/          # Shared server/client utilities and domain logic
contracts/    # Shared TypeScript types/interfaces for API and domain contracts
public/       # Static assets
```

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```
2. Create your local env file:
   ```bash
   cp .env.example .env.local
   ```
3. Run dev server:
   ```bash
   npm run dev
   ```
4. Build for production:
   ```bash
   npm run build
   ```

## Notes
- Use `@/*` imports from the repository root (for example: `@/components/...`, `@/lib/...`).
- Keep secrets in server-side env variables only (never hardcode secrets into client components).
