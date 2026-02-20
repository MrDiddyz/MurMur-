# MURMUR : A Learning Constellation

Production-ready marketing website for MURMUR, built with Next.js (App Router), TypeScript, and Tailwind CSS.

## Stack
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Server Actions for contact form handling
- SEO metadata + sitemap + robots

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

## Deploy + connect to `MurMurApp.no` (Vercel)
1. Push repository to GitHub.
2. Import project in Vercel (Framework preset: **Next.js**).
3. Add environment variable in Vercel:
   - `NEXT_PUBLIC_SITE_URL=https://murmurapp.no`
4. In Vercel **Project Settings → Domains**, add:
   - `murmurapp.no`
   - `www.murmurapp.no` (optional, then redirect to apex or vice versa)
5. In your DNS provider:
   - Apex/root `@` → A record to `76.76.21.21` (Vercel)
   - `www` → CNAME to `cname.vercel-dns.com`
6. Set canonical preference (apex recommended), and configure redirect for the other host.
7. Trigger deploy. Verify:
   - `https://murmurapp.no`
   - `https://murmurapp.no/sitemap.xml`
   - `https://murmurapp.no/robots.txt`

## Domain handling in code
- Site URL is centralized in `src/lib/site.ts`.
- Fallback URL is `https://murmurapp.no`.
- These use the same base URL automatically:
  - metadata/Open Graph (`src/app/layout.tsx`)
  - sitemap (`src/app/sitemap.ts`)
  - robots (`src/app/robots.ts`)

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
