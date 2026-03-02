# MurMur Monorepo Bootstrap (PR0)

This PR establishes a deterministic baseline for upcoming PRs:

- Standard top-level folders (`backend/`, `nginx/`, `database/migrations/`, `scripts/`)
- Postgres service in Docker
- Dedicated migration runner container using plain SQL files
- One-command local setup path and one-command CI-style verify path

## Prerequisites

- Docker Engine + Docker Compose plugin (`docker compose`)

## Setup

1. Copy env template:

```bash
cp .env.example .env
```

2. Edit `.env` and set a strong password:

```dotenv
POSTGRES_PASSWORD=your_strong_password
```

## Run DB + migrations

Start just Postgres:

```bash
docker compose up -d db
```

Run migrations:

```bash
docker compose run --rm migrator
```

One-liner equivalent:

```bash
docker compose up -d db && docker compose run --rm migrator
```

## Verify stack (CI-like smoke run)

```bash
docker compose -f docker-compose.verify.yml --env-file .env up --abort-on-container-exit --exit-code-from migrator
```

This exits `0` when migrations complete successfully.

## Migrations

- Location: `database/migrations/`
- File type: plain `.sql`
- Execution order: sorted by filename
- Naming convention: numeric prefix, e.g.:
  - `001_create_users.sql`
  - `002_add_indexes.sql`

### Add a new migration

1. Create a new SQL file in `database/migrations` with the next numeric prefix.
2. Keep migrations deterministic and idempotent when possible.
3. Run:

```bash
docker compose run --rm migrator
```

## Optional Makefile shortcuts

```bash
make up
make migrate
make verify
```
