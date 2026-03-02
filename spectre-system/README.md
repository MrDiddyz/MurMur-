# Spectre Simulation Engine (PR0 Bootstrap)

Spectre is an emotion-less options trading simulation framework. This PR0 bootstrap delivers a deterministic local simulation loop with modular boundaries that can grow into services later.

## Local setup (Poetry)

```bash
cd spectre-system
poetry install
```

## Run simulation

```bash
poetry run python -m simulation.engine --data simulation/data/sample_ticks.csv
```

Or without Poetry after dependency install:

```bash
python -m simulation.engine --data simulation/data/sample_ticks.csv
```

## Run tests

```bash
poetry run pytest -q
```

## Run with Docker

```bash
docker compose up --build sim
```

## Architecture flow

`replay -> feature_pipeline -> regime_classifier -> decision_engine -> execution_simulator -> portfolio -> stress_engine -> edge_monitor -> metrics_collector`

## Roadmap

- PR1: Timestamp integrity and no-future-data leakage checks.
- PR2: Execution slippage and realistic fill modeling.
- PR3: Risk stress scenario modeling.
- PR4: Edge/health monitor and alerting hooks.
- PR5: Regime classification with richer state transitions.
