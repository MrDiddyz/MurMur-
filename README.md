# MurMur Base Stack

Minimal 1-server skeleton with FastAPI + Postgres + Nginx using Docker Compose.

## Run with Docker

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

4. (Optional) Verify common local endpoints:
   ```bash
   ./scripts/check_local_stack.sh  # uses default endpoints
   ```

## Troubleshooting

- If `docker` is not installed in your environment, install Docker Engine + Docker Compose plugin first.
- If startup succeeds but services are unreachable, run:
  ```bash
  ./scripts/check_local_stack.sh  # uses default endpoints
  ```

- If your stack uses different ports/URLs, pass custom endpoints directly:
  ```bash
  ./scripts/check_local_stack.sh \
    --endpoint "Web app|http://localhost:3000" \
    --endpoint "Admin panel|http://localhost:4000" \
    --endpoint "API|http://localhost:5000"
  ```
- Or configure endpoints via environment variable:
  ```bash
  export STACK_ENDPOINTS="Web app|http://localhost:3000;API|http://localhost:5000"
  ./scripts/check_local_stack.sh
  ```

## Run without Docker (fallback)

If Docker/Compose is not available in your shell, you can still run the API directly.

1. Create and activate a virtual environment:
   ```bash
   python3 -m venv .venv
   source .venv/bin/activate
   ```
2. Install backend dependencies:
   ```bash
   pip install -r backend/requirements.txt
   ```
3. Start the FastAPI app:
   ```bash
   uvicorn backend.main:app --host 0.0.0.0 --port 8000
   ```
4. Verify health:
   ```bash
   curl http://localhost:8000/api/v1/health
   ```
