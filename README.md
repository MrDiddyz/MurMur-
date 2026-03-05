# MurMur Base Stack

Minimal 1-server skeleton with FastAPI + Postgres + Nginx using Docker Compose.

## Install

1. Clone the repository and enter the project directory:
   ```bash
   git clone <your-repo-url>
   cd MurMur-
   ```
2. Create your environment file:
   ```bash
   cp .env.example .env
   ```
3. Set required secrets in `.env` (at least `POSTGRES_PASSWORD`).
4. Build the service images:
   ```bash
   docker compose build
   ```

## Run

1. Start the stack:
   ```bash
   docker compose up -d
   ```
2. Confirm containers are healthy/running:
   ```bash
   docker compose ps
   ```
3. Check the API health endpoint through Nginx:
   ```bash
   curl http://localhost/api/v1/health
   ```
4. Open API docs:
   ```bash
   open http://localhost/docs
   ```
   If `open` is unavailable on your OS, use one of these:
   ```bash
   xdg-open http://localhost/docs
   # or
   start http://localhost/docs
   ```

## Test

Use these checks as a quick quality gate after changes:

1. Validate compose configuration:
   ```bash
   docker compose config --quiet
   ```
2. Confirm app health endpoint returns success:
   ```bash
   curl -fsS http://localhost/api/v1/health
   ```
3. Confirm readiness endpoint returns success:
   ```bash
   curl -fsS http://localhost/api/v1/ready
   ```

## Troubleshoot

### Port 80 is already in use

Symptom:

```text
Error starting userland proxy: listen tcp 0.0.0.0:80: bind: address already in use
```

Fix:

```bash
# Find process using port 80
lsof -i :80

# Stop conflicting process, then retry
docker compose up -d
```

### API returns 502 from Nginx

Symptom:

```bash
curl -i http://localhost/api/v1/health
# HTTP/1.1 502 Bad Gateway
```

Fix:

```bash
# Inspect backend logs
docker compose logs backend --tail=100

# Restart backend and nginx
docker compose restart backend nginx
```

### Database connection issues

Symptom:
Backend logs contain authentication/connection errors.

Fix:

```bash
# Verify env file includes POSTGRES_PASSWORD
cat .env

# Recreate stack after env fixes
docker compose down
docker compose up -d --build
```

## Why

- **Nginx in front of FastAPI** gives a single public entrypoint and mirrors common production routing.
- **Postgres in Compose** makes local state reproducible across environments.
- **Health + readiness checks** provide a fast smoke test path for local verification and CI automation.
