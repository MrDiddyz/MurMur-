# MurMur

MurMur er en modulær AI-plattform for orkestrering av spesialiserte agenter, minne og simulering for styrte beslutningssystemer. Plattformen leveres som en SaaS-løsning med fullstack-støtte for webgrensesnitt, API, AI-agenter, og betalingsintegrasjoner.

## Innholdsfortegnelse

- [Stack](#stack)
- [Forutsetninger](#forutsetninger)
- [Miljøvariabler](#miljøvariabler)
- [Lokal kjøring](#lokal-kjøring)
- [Bruksinstruksjoner](#bruksinstruksjoner)
- [Stoppe appen](#stoppe-appen)
- [Verifikasjon og bygg](#verifikasjon-og-bygg)
- [Stripe-oppsett](#stripe-oppsett)
- [Vipps Startpakke-oppsett](#vipps-startpakke-oppsett)
- [Supabase-oppsett](#supabase-oppsett)
- [Vercel-konfigurasjon](#vercel-konfigurasjon)
- [Utrulling](#utrulling-github--vercel--domeneshop)
- [Sikkerhet](#sikkerhet)

---

## Stack

- **Frontend:** Next.js 14 (App Router) + TypeScript + Tailwind CSS
- **Backend API:** FastAPI (Python) – `app.py`
- **AI-kjerne:** Ollama (lokal LLM-kjøring via `murmur/core/engine.py`)
- **Betalinger:** Stripe Checkout / Payment Links + Billing Portal
- **Norsk betaling:** Vipps Startpakke (engangsbeløp NOK 1490)
- **Database / Auth:** Supabase (Postgres + Auth + RLS)
- **Cache / kø:** Redis
- **Infrastruktur:** Docker Compose (lokal), Vercel (produksjon)

---

## Forutsetninger

Sørg for at følgende er installert før du starter:

- [Node.js](https://nodejs.org/) v18 eller nyere + npm v10+
- [Python](https://www.python.org/) 3.10 eller nyere
- [Docker](https://www.docker.com/) + Docker Compose
- [Ollama](https://ollama.com/) (for lokal AI-kjøring, valgfritt)

---

## Miljøvariabler

Kopier eksempelfilen og fyll inn verdiene:

```bash
cp .env.example .env.local
```

Viktige variabler:

| Variabel | Beskrivelse |
|---|---|
| `SUPABASE_URL` | URL til Supabase-prosjektet ditt |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role-nøkkel (kun server-side) |
| `STRIPE_SECRET_KEY` | Stripe hemmelig API-nøkkel |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook-signeringsnøkkel |
| `VIPPS_CLIENT_ID` | Vipps klient-ID |
| `VIPPS_CLIENT_SECRET` | Vipps klienthemmelighet |
| `DATABASE_URL` | PostgreSQL tilkoblingsstreng |
| `CRON_SECRET` | Hemmelig nøkkel for cron-endepunkt |
| `DEV_FALLBACK_USER_ID` | Kun for lokal testing – ikke aktiver i produksjon |

> **Advarsel:** Del aldri `SUPABASE_SERVICE_ROLE_KEY` eller andre hemmelige nøkler i klientkoden.

---

## Lokal kjøring

### Alternativ 1 – Docker Compose (anbefalt)

Starter alle tjenester (API, web, agenter, Postgres, Redis) med ett kommando:

```bash
docker compose up --build
```

Tjenester tilgjengelig etter oppstart:

| Tjeneste | URL |
|---|---|
| Webgrensesnitt | http://localhost:3000 |
| API | http://localhost:10000 |
| API-helse | http://localhost:10000/health |

### Alternativ 2 – Manuell kjøring

**Installer avhengigheter:**

```bash
npm install
pip install -r murmur/requirements.txt
```

**Start webappen og API separat:**

```bash
# Webgrensesnitt (Next.js)
npm run dev

# FastAPI-backend
uvicorn app:app --reload
```

- Webgrensesnitt: http://localhost:3000
- API-dokumentasjon (Swagger UI): http://localhost:8000/docs

---

## Bruksinstruksjoner

### Webgrensesnitt

1. Åpne http://localhost:3000 i nettleseren.
2. Logg inn via Supabase Auth.
3. Du får tilgang til dashboardet på `/dashboard` etter innlogging.

### API-endepunkter

#### Opprett en kjøring (orkestrering)

```bash
curl -X POST http://localhost:8000/v1/runs \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "din-bruker-id",
    "text": "Lag en innholdsplan for neste uke"
  }'
```

#### Hent status for en kjøring

```bash
curl http://localhost:8000/v1/runs/<run_id>
```

#### Godkjenn en kjøring som venter på menneskelig gjennomgang

```bash
curl -X POST http://localhost:8000/v1/runs/<run_id>/approve \
  -H "Content-Type: application/json" \
  -d '{"reviewerId": "din-bruker-id"}'
```

#### Avatar-operatør

```bash
curl -X POST http://localhost:8000/v1/avatar/operate \
  -H "Content-Type: application/json" \
  -d '{
    "avatar_core": {"name": "Min Avatar"},
    "context": {},
    "memory": {},
    "task": "content_creator",
    "constraints": {},
    "telemetry": {}
  }'
```

Tilgjengelige `task`-verdier: `content_creator`, `offer_seller`, `decision_engine`, `daily_operator`.

---

## Stoppe appen

### Stoppe Docker Compose

For å stoppe alle kjørende tjenester:

```bash
docker compose down
```

For å stoppe og fjerne alle data (volumes):

```bash
docker compose down -v
```

### Stoppe manuell kjøring

Trykk `Ctrl + C` i terminalen der `npm run dev` eller `uvicorn` kjører.

For å stoppe alle prosesser på en gang (macOS/Linux):

```bash
# Finn prosessen
lsof -ti :3000 | xargs kill -9   # Stopp webappen (port 3000)
lsof -ti :8000 | xargs kill -9   # Stopp API (port 8000)
lsof -ti :10000 | xargs kill -9  # Stopp API i Docker-modus (port 10000)
```

---

## Verifikasjon og bygg

```bash
npm run lint
npm run typecheck
npm run build
```

---

## Stripe-oppsett

1. Opprett produkter/priser:
   - Starter (€49/mnd)
   - Growth (€149/mnd)
2. Opprett Checkout-lenker og inkluder `client_reference_id=<supabase_user_id>`.
3. Konfigurer webhook-endepunkt:
   - URL: `https://<ditt-domene>/api/webhooks/stripe`
   - Hendelser: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Legg til webhook-signeringsnøkkel i `STRIPE_WEBHOOK_SECRET`.
5. Aktiver billing portal i Stripe og hold `BILLING_PORTAL_RETURN_URL` i samsvar med `/dashboard`.

---

## Vipps Startpakke-oppsett

1. Opprett Vipps-betalingslenke for **NOK 1490** (engangsbeløp).
2. Kart vellykkede kjøp til `subscriptions` med:
   - `provider = 'vipps'`
   - `plan_code = 'vipps_startpakke'`
3. Lagre kundereferansen i `customers.vipps_customer_ref`.

---

## Supabase-oppsett

1. Opprett prosjekt i Supabase.
2. Kjør SQL fra `supabase/schema.sql` i SQL-editoren.
3. Aktiver RLS-policyer passende for organisasjonen (service role brukes kun server-side).
4. Bruk Supabase Auth bruker-ID som kanonisk kundeidentitet (`customers.user_id`).

---

## Vercel-konfigurasjon

`vercel.json` er inkludert med:

- Rammeverk-deteksjon for Next.js
- Cron-plan (`*/30 * * * *`) for `/api/jobs/subscription-sync`
- Grunnleggende sikkerhetshoder (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`)

Sett `CRON_SECRET` i Vercel-prosjektets miljøvariabler. Vercel sender den som `Authorization: Bearer <CRON_SECRET>` til jobbendepunktet.

---

## Utrulling (GitHub → Vercel → Domeneshop)

1. Push repositoriet til GitHub.
2. Importer prosjektet i Vercel.
3. Legg til alle miljøvariabler i Vercel Project Settings.
4. Konfigurer cron til `POST /api/jobs/subscription-sync` med `Authorization: Bearer <CRON_SECRET>`.
5. Domeneshop DNS:
   - `A`-record root (`@`) → Vercel IP
   - `CNAME` `www` → `cname.vercel-dns.com`
6. Sett primærdomene til `murmurapp.no` i Vercel.

---

## Sikkerhet

- Ikke eksponer `SUPABASE_SERVICE_ROLE_KEY` til klientkoden.
- Verifiser Stripe webhook-signaturer mot råt request-body.
- Hold webhook-prosessering idempotent med unike hendelsesnøkler.
- Bruk en sterk `CRON_SECRET` for cron-endepunktet.
- Legg til rate limiting/WAF og varsling før full produksjonsutrulling.
- Revider regelmessig `audit_log` og mislykkede webhook-svar.
