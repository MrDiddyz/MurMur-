# GenealogyMaster

Monorepo scaffold for a genealogy platform with FastAPI backend, Next.js frontend, AI helper agents, and a Codex workflow utility.

## Structure

- `backend/`: FastAPI app, models, routers, services, DB setup.
- `frontend/`: Next.js pages, components, and shared libs.
- `ai_agents/`: lightweight AI agent wrappers.
- `codex_workflow/`: prompt-driven code-generation workflow artifacts.
  - `codex_runner.py`: CLI that reads a prompt, calls Codex, and saves generated code.
  - `prompts/`: reusable prompt templates.
  - `results/`: generated code outputs.
  - `requirements.txt`: dependencies for Codex workflow.
- `data/`: local storage for documents and DNA data.
- `docker-compose.yml`: local backend/frontend orchestration.

## Codex workflow quickstart

```bash
cd GenealogyMaster/codex_workflow
pip install -r requirements.txt
export OPENAI_API_KEY="your_api_key"
python codex_runner.py \
  --prompt-file prompts/generate_endpoint.txt \
  --output-file results/person_router_generated.py
```

`--prompt-file` and `--output-file` support absolute paths, or paths relative to `codex_workflow/`.


## API endpoints

- `GET /api/persons/search?navn=<str>&fødselsår=<int>&sted=<str>`: søker etter personer i PostgreSQL via SQLAlchemy.
