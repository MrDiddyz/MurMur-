# Stripe Checkout (Sinatra)

Minimal Sinatra server for Stripe Checkout session creation and session status lookup.

## Environment variables

- `STRIPE_SECRET_KEY` (required)
- `STRIPE_PRICE_ID` (required)
- `STRIPE_API_VERSION` (optional, default `2026-02-25.clover`)
- `YOUR_DOMAIN` (optional, default `http://localhost:4242`)
- `PORT` (optional, default `4242`)

## Run

```bash
bundle add sinatra stripe
STRIPE_SECRET_KEY=sk_test_... STRIPE_PRICE_ID=price_... ruby server.rb
```

## Endpoints

- `POST /create-checkout-session`
- `GET /session-status?session_id=cs_...`
