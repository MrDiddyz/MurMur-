# MurMur SaaS (Marketing + Billing Core)

Production-ready foundation for **murmurapp.no** with Next.js App Router, Stripe subscriptions, Vipps Startpakke onboarding, Supabase persistence, protected dashboard access, and operational endpoints.

## Stack

- Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Stripe Checkout / Payment Links + Billing Portal
- Vipps Startpakke (one-time, NOK 1490) via payment link
- Supabase Auth + Postgres (customers, subscriptions, events, audit log)
- Vercel deployment flow from GitHub

## Delivered Modules

- Marketing pages (NO + EN): `/` and `/en`
- Protected customer dashboard: `/dashboard`
- Stripe webhook endpoint with signature verification + idempotency: `/api/webhooks/stripe`
- Stripe customer portal endpoint: `/api/billing/portal`
- Subscription sync cron job endpoint: `/api/jobs/subscription-sync`
- Health endpoint: `/api/health`
- Supabase SQL schema: `supabase/schema.sql`

## Environment Variables

Copy `.env.example` to `.env.local` and fill values:

```bash
cp .env.example .env.local
```

> `DEV_FALLBACK_USER_ID` is only for local testing and should not be enabled in production.

## Local Run

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Required Checks

```bash
npm run lint
npm run typecheck
npm run build
```

## Stripe Setup

1. Create products/prices:
   - Starter (€49/month)
   - Growth (€149/month)
2. Create Checkout links (or use API) and include `client_reference_id=<supabase_user_id>`.
3. Configure webhook endpoint:
   - URL: `https://<your-domain>/api/webhooks/stripe`
   - Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Add webhook signing secret to `STRIPE_WEBHOOK_SECRET`.
5. Enable billing portal in Stripe and keep `BILLING_PORTAL_RETURN_URL` aligned with `/dashboard`.

## Vipps Startpakke Setup

1. Create Vipps payment link for **NOK 1490** (one-time).
2. Map successful purchases into `subscriptions` with:
   - `provider = 'vipps'`
   - `plan_code = 'vipps_startpakke'`
3. Store customer reference in `customers.vipps_customer_ref`.

## Supabase Setup

1. Create project in Supabase.
2. Run SQL from `supabase/schema.sql` in SQL editor.
3. Enable RLS policies appropriate for your org (service role is used only server-side for backend routes).
4. Use Supabase Auth user ID as canonical customer identity (`customers.user_id`).


## Vercel Configuration

The repo now includes `vercel.json` with:

- framework detection for Next.js
- cron schedule (`*/30 * * * *`) for `/api/jobs/subscription-sync`
- baseline security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`)

For cron auth, set `CRON_SECRET` in Vercel project environment variables. Vercel will send it as `Authorization: Bearer <CRON_SECRET>` to the job endpoint.

## Deployment (GitHub → Vercel → Domeneshop)

1. Push repository to GitHub.
2. Import project in Vercel.
3. Add all environment variables in Vercel Project Settings.
4. Configure cron call to `POST /api/jobs/subscription-sync` with `Authorization: Bearer <CRON_SECRET>`.
5. Domeneshop DNS:
   - `A` record root (`@`) → Vercel IP (as documented by Vercel at setup time)
   - `CNAME` `www` → cname.vercel-dns.com
6. Set primary domain to `murmurapp.no` in Vercel.

## Safety / Production Disclaimers

- Never expose `SUPABASE_SERVICE_ROLE_KEY` client-side.
- Verify Stripe webhook signatures against raw request body only.
- Keep webhook processing idempotent using unique event keys.
- Restrict cron endpoint with a strong `CRON_SECRET`.
- Add rate limiting/WAF and alerting before full production rollout.
- Regularly audit `audit_log` and failed webhook responses.
