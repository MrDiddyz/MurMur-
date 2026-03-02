import random

from sqlalchemy import func
from sqlalchemy.orm import Session

from backend.config import settings
from backend.models import StrategyMemory


def select_strategy(db: Session) -> tuple[str, str, float]:
    rows = (
        db.query(StrategyMemory.strategy, func.avg(StrategyMemory.score).label("avg_score"))
        .group_by(StrategyMemory.strategy)
        .all()
    )
    if not rows:
        raise ValueError("No strategy memory found.")

    epsilon = max(settings.min_epsilon, settings.epsilon)
    if random.random() < epsilon:
        chosen = random.choice(rows)
        mode = "explore"
    else:
        chosen = max(rows, key=lambda r: r.avg_score)
        mode = "exploit"

    return chosen.strategy, mode, float(chosen.avg_score)


def apply_reward(db: Session, strategy: str, reward: float) -> StrategyMemory:
    memory = StrategyMemory(strategy=strategy, score=reward)
    db.add(memory)
    return memory
