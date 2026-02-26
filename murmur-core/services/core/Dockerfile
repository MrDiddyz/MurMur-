FROM python:3.11-slim

WORKDIR /app
COPY pyproject.toml /app/pyproject.toml
COPY src /app/src

RUN pip install --no-cache-dir -U pip && \
    pip install --no-cache-dir "fastapi>=0.110" "uvicorn[standard]>=0.27" "pydantic>=2.6" "pytest>=8.0"

ENV PYTHONPATH=/app/src
EXPOSE 8080

CMD ["uvicorn", "murmur_core.api:app", "--host", "0.0.0.0", "--port", "8080"]
