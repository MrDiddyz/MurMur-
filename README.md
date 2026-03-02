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
