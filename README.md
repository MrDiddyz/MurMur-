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

## LinkedIn

```html
<div class="badge-base LI-profile-badge" data-locale="no_NO" data-size="medium" data-theme="dark" data-type="HORIZONTAL" data-vanity="papii-daniel-leon-andersen-7239903a6" data-version="v1"><a class="badge-base__link LI-simple-link" href="https://no.linkedin.com/in/papii-daniel-leon-andersen-7239903a6?trk=profile-badge">Papii Daniel Leon Andersen</a></div>
```
