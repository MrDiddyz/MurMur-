# MurMur Engine (FastAPI + PostgreSQL)

Production-ready FastAPI backend for a reinforcement-learning social content engine.

## Repo Structure

```text
murmur-engine/
├── backend/
│   ├── main.py
│   ├── db.py
│   ├── models.py
│   ├── strategy.py
│   ├── pipeline.py
│   ├── config.py
│   └── __init__.py
│
├── database/
│   └── migration.sql
│
├── requirements.txt
├── Procfile
├── railway.json
├── .env.example
└── README.md
```

## Features

- FastAPI application with health and strategy endpoints
- PostgreSQL support with SQLAlchemy + psycopg2
- `ideas`, `scores`, and `strategy_memory` persistence tables
- Explore/exploit strategy selection (epsilon-greedy)
- Reward feedback pipeline to update strategy performance
- Railway deployment config and Procfile

## Dependency Versions

- fastapi==0.110.0
- uvicorn[standard]==0.29.0
- psycopg2-binary==2.9.9
- python-dotenv==1.0.1
- openai==1.14.3
- pydantic==2.6.4

## Local Run

```bash
cd murmur-engine
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
psql "$DATABASE_URL" -f database/migration.sql
uvicorn backend.main:app --reload
```

## API Endpoints

- `GET /health`
- `POST /strategies`
- `GET /strategies`
- `POST /selection`
- `POST /strategies/{strategy}/reward`

## Railway Deploy Steps

1. Push repository to Git provider.
2. Create Railway project from the repository.
3. Add PostgreSQL plugin/service.
4. Set env vars from `.env.example`.
5. Deploy using `railway.json` start command.
6. Run migration in Railway shell:
   ```bash
   psql "$DATABASE_URL" -f database/migration.sql
   ```


## Environment Variables

Use the following minimum environment variables (also included in `.env.example`):

```env
DATABASE_URL=postgresql://user:password@host:5432/dbname
OPENAI_API_KEY=your_openai_key
ENV=production
```


## Database Schema

The SQL migration creates:
- `ideas(id, content, strategy, created_at)`
- `scores(id, idea_id, engagement, created_at)`
- `strategy_memory(id, strategy, score, created_at)`

An index is created on `strategy_memory(strategy)` for fast strategy lookups.
