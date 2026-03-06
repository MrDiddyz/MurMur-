# MurMur Base Stack

Minimal 1-server skeleton with FastAPI + Postgres + Nginx using Docker Compose.

## Run

1. Copy environment file:
   ```bash
   cp .env.example .env
   ```
2. Build and start services:
   ```bash
   docker compose up -d --build
   ```
3. Check health endpoint via Nginx:
   ```bash
   curl http://localhost/health
   ```

## Stripe payments setup (MurMurLab)

### Stripe dashboard configuration
- Create one recurring Price and set its ID in `STRIPE_SUBSCRIPTION_PRICE_ID`.
- Enable **Connect Express** and ensure artist payout accounts can be created.
- Configure platform API keys in local `.env` using `.env.example`.

### Webhook events to subscribe
Point Stripe webhooks to `/api/payments/stripe-webhook` and subscribe to:
- `checkout.session.completed`
- `invoice.paid`
- `invoice.payment_failed`
- `customer.subscription.updated`
- `customer.subscription.deleted`

### Local testing notes
- Run `npm run dev` and expose your local server using Stripe CLI.
- Example forwarding command:
  - `stripe listen --forward-to localhost:3000/api/payments/stripe-webhook`
- Copy the generated webhook signing secret into `STRIPE_WEBHOOK_SECRET`.

### Test webhook delivery
- Trigger checkout/session or billing test events with Stripe CLI.
- Validate that `orders`, `artist_subscriptions`, and `subscription_payments` update from webhook events (source of truth).
