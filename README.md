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

## Delivery workflow

For feature work, follow the architecture-first, file-by-file process documented in:

- `docs/architecture-phases.md`
- `docs/file-generation-template.md`
