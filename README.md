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

## Reliable package installation

If dependency installation is flaky or blocked on the default npm registry, use the hardened installer:

```bash
npm run deps:install:robust
```

You can provide fallback registries and retry settings:

```bash
FALLBACK_REGISTRIES='https://npm.your-company.local https://registry.npmjs.org' \
INSTALL_RETRIES=5 \
INSTALL_BACKOFF_SECONDS=3 \
bash scripts/install-deps.sh pinata-web3 ethers
```
