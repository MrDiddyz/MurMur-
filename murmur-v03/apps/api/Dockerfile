FROM python:3.11-slim
WORKDIR /app
COPY apps/api/requirements.txt /app/requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY . /app
ENV PYTHONPATH=/app
CMD ["bash", "-lc", "alembic upgrade head && uvicorn apps.api.main:app --host 0.0.0.0 --port 8000"]
