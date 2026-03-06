# Home Security MVP API

Minimal Express + Postgres API for ingesting home-security events, applying JSON rules, and creating actionable alerts.

## Setup

1. **Apply database schema and seed rules**
   ```bash
   psql "$DATABASE_URL" -f schema.sql
   ```

2. **Set `DATABASE_URL`**
   ```bash
   export DATABASE_URL='postgres://USER:PASSWORD@HOST:5432/DBNAME'
   ```

3. **Install dependencies**
   ```bash
   npm i
   ```

4. **Start server**
   ```bash
   npm start
   ```

5. **Run golden validation**
   ```bash
   npm run golden
   ```

Expected golden output includes:

```text
✅ Golden run OK: 3 events -> 2 alerts
```

## Endpoints

- `GET /health`
- `POST /events`
- `POST /alerts/:id/ack`
- `POST /alerts/:id/resolve`
- `GET /alerts`


## Home usage notes

- `GET /alerts?limit=50` can be used by a dashboard to fetch the latest alerts without loading a full history.
- `POST /alerts/:id/ack` now rejects already-resolved alerts (`409`) to prevent accidental state regressions.
- `GET /health` returns `db` (boolean) and `db_error` (nullable string) for simple local diagnostics.
