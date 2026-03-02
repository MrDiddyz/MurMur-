import os
import uuid
from datetime import datetime

import psycopg2
from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel, Field
from psycopg2.extensions import connection as PgConnection

from backend.auth.deps import require_api_key_dep
from backend.auth.security import hash_password
from backend.db import get_connection
from backend.routes.admin_keys import router as admin_keys_router
from backend.routes.auth_admin import router as auth_admin_router

app = FastAPI()
app.include_router(auth_admin_router)
app.include_router(admin_keys_router)


class GoalRequest(BaseModel):
    goal: str = Field(min_length=1, max_length=10_000)


def bootstrap_admin_user() -> None:
    email = os.getenv("ADMIN_BOOTSTRAP_EMAIL")
    password = os.getenv("ADMIN_BOOTSTRAP_PASSWORD")
    if not email or not password:
        return

    database_url = os.getenv("DATABASE_URL")
    if not database_url:
        return

    with psycopg2.connect(database_url) as db:
        with db.cursor() as cur:
            cur.execute("SELECT id FROM admin_users WHERE email = %s", (email.lower(),))
            if cur.fetchone():
                return

            cur.execute(
                """
                INSERT INTO admin_users(email, password_hash, is_active)
                VALUES (%s, %s, TRUE)
                """,
                (email.lower(), hash_password(password)),
            )
            db.commit()


@app.on_event("startup")
def on_startup():
    bootstrap_admin_user()


@app.post("/run")
def run_agent(
    req: GoalRequest,
    db: PgConnection = Depends(get_connection),
    _api_key=Depends(require_api_key_dep),
):
    run_id = str(uuid.uuid4())
    result = f"Executed goal: {req.goal}"

    try:
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

    return {"run_id": run_id, "result": result}


@app.get("/health")
def health(db: PgConnection = Depends(get_connection)):
    try:
        with db.cursor() as cur:
            cur.execute("SELECT 1")
            cur.fetchone()
    except psycopg2.Error:
        raise HTTPException(status_code=503, detail="database unavailable")
    return {"status": "ok"}
