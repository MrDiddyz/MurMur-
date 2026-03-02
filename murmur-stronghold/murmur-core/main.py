import uuid
from datetime import datetime

from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel, Field

from auth import verify_token
from db import close_db, execute, fetch_val, init_db

app = FastAPI()


@app.on_event("startup")
async def startup() -> None:
    await init_db()


@app.on_event("shutdown")
async def shutdown() -> None:
    await close_db()


class GoalRequest(BaseModel):
    goal: str = Field(min_length=1, max_length=10_000)


@app.post("/run")
async def run_agent(req: GoalRequest, auth=Depends(verify_token)):
    run_id = str(uuid.uuid4())
    result = f"Executed goal: {req.goal}"

    try:
        await execute(
            """
            INSERT INTO agent_runs(run_id, goal, result, created_at)
            VALUES ($1, $2, $3, $4)
            """,
            run_id,
            req.goal,
            result,
            datetime.utcnow(),
        )
    except Exception as exc:
        raise HTTPException(status_code=503, detail="database unavailable") from exc

    return {"run_id": run_id, "result": result}


@app.get("/health")
async def health():
    try:
        await fetch_val("SELECT 1")
    except Exception:
        raise HTTPException(status_code=503, detail="database unavailable")
    return {"status": "ok"}
