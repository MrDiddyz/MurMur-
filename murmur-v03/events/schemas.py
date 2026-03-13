from datetime import datetime
from typing import Any

from pydantic import BaseModel, Field


class EventEnvelope(BaseModel):
    event_id: str
    job_id: str
    run_id: str
    seq: int
    type: str
    timestamp: datetime
    version: str = "v0.3"
    actor: str
    payload: dict[str, Any] = Field(default_factory=dict)
    meta: dict[str, Any] = Field(default_factory=dict)
