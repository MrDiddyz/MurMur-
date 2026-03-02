from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from backend.models import StrategyMemory
from backend.strategy import apply_reward, select_strategy


class PipelineDecision(BaseModel):
    mode: str
    strategy: str
    expected_value: float


class RewardPayload(BaseModel):
    reward: float = Field(description="Observed reward signal from content performance")


def run_selection_pipeline(db: Session) -> PipelineDecision:
    strategy, mode, expected_value = select_strategy(db)
    return PipelineDecision(mode=mode, strategy=strategy, expected_value=expected_value)


def run_feedback_pipeline(db: Session, strategy: str, reward: float) -> StrategyMemory:
    memory = apply_reward(db, strategy, reward)
    db.commit()
    db.refresh(memory)
    return memory
