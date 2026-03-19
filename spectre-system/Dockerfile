FROM python:3.11-slim

WORKDIR /app

COPY pyproject.toml README.md /app/
COPY shared /app/shared
COPY simulation /app/simulation
COPY modules /app/modules

RUN pip install --no-cache-dir poetry && \
    poetry config virtualenvs.create false && \
    poetry install --only main --no-interaction --no-ansi

CMD ["python", "-m", "simulation.engine", "--data", "simulation/data/sample_ticks.csv"]
