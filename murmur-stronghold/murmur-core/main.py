import os
import uuid
from datetime import datetime
import logging

import psycopg2
from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel, Field

from auth import verify_token
from logging_config import setup_json_logging
from middleware import RequestLogMiddleware
from routes.tasks import router as tasks_router

setup_json_logging(os.getenv("SERVICE_NAME", "murmur-api"))

app = FastAPI()
app.add_middleware(RequestLogMiddleware)
app.include_router(tasks_router)
logger = logging.getLogger("api")


def get_connection():
    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        raise HTTPException(status_code=500, detail="DATABASE_URL not configured")
    return psycopg2.connect(database_url)


class GoalRequest(BaseModel):
    goal: str = Field(min_length=1, max_length=10_000)


@app.post("/run")
def run_agent(req: GoalRequest, auth=Depends(verify_token)):
    run_id = str(uuid.uuid4())
    result = f"Executed goal: {req.goal}"

    try:
        with get_connection() as db:
            with db.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO agent_runs(run_id, goal, result, created_at)
                    VALUES (%s,%s,%s,%s)
                    """,
                    (run_id, req.goal, result, datetime.utcnow()),
                )
                db.commit()
    except psycopg2.Error as exc:
        raise HTTPException(status_code=503, detail="database unavailable") from exc

    logger.info("agent.run", extra={"event": "agent.run", "run_id": run_id})
    return {"run_id": run_id, "result": result}


@app.get("/health")
def health():
    try:
        with get_connection() as db:
            with db.cursor() as cur:
                cur.execute("SELECT 1")
                cur.fetchone()
    except psycopg2.Error:
        raise HTTPException(status_code=503, detail="database unavailable")
    return {"status": "ok"}
