# api_fastapi

Minimal FastAPI service with health and API-key protected ping endpoints.

## Endpoints

- `GET /health` → `{ "ok": true }`
- `GET /secure/ping` (requires `X-API-KEY` header) → `{ "message": "pong" }`

## Configuration

Environment variables (optional):

- `MURMUR_API_KEY` (default: `dev-api-key`)

## Run

```bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

## Test

```bash
pytest
```
