from datetime import datetime

from fastapi import Depends, FastAPI, HTTPException
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from backend.config import settings
from backend.db import Base, engine, get_db
from backend.models import StrategyMemory
from backend.pipeline import RewardPayload, run_feedback_pipeline, run_selection_pipeline

app = FastAPI(title=settings.app_name)


class StrategyCreate(BaseModel):
    strategy: str = Field(min_length=2, max_length=255)
    score: float = 0.0


class StrategyRead(BaseModel):
    id: int
    strategy: str
    score: float
    created_at: datetime

    model_config = {"from_attributes": True}


@app.on_event("startup")
def startup() -> None:
    Base.metadata.create_all(bind=engine)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "environment": settings.app_env}


@app.post("/strategies", response_model=StrategyRead, status_code=201)
def create_strategy(payload: StrategyCreate, db: Session = Depends(get_db)) -> StrategyMemory:
    row = StrategyMemory(strategy=payload.strategy, score=payload.score)
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@app.get("/strategies", response_model=list[StrategyRead])
def list_strategies(db: Session = Depends(get_db)) -> list[StrategyMemory]:
    return db.query(StrategyMemory).order_by(StrategyMemory.created_at.desc()).all()


@app.post("/selection")
def choose_strategy(db: Session = Depends(get_db)) -> dict:
    try:
        result = run_selection_pipeline(db)
    except ValueError as exc:
        raise HTTPException(status_code=400, detail=str(exc)) from exc
    return result.model_dump()


@app.post("/strategies/{strategy}/reward", response_model=StrategyRead)
def submit_reward(strategy: str, payload: RewardPayload, db: Session = Depends(get_db)) -> StrategyMemory:
    return run_feedback_pipeline(db, strategy, payload.reward)
