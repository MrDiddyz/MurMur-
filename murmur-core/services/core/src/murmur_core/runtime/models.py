from __future__ import annotations

import uuid
from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, Field

Role = Literal["orchestrator", "research", "builder", "content", "optimizer", "memory", "reflection"]
EventType = Literal["goal_received", "plan_created", "task_created", "task_done", "reflection", "summary"]


class Event(BaseModel):
    event_id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    run_id: str
    ts: str = Field(default_factory=lambda: datetime.utcnow().isoformat() + "Z")
    role: Role
    type: EventType
    message: str
    data: dict = Field(default_factory=dict)


class Task(BaseModel):
    task_id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    run_id: str
    role: Role
    title: str
    input: dict = Field(default_factory=dict)
    output: dict = Field(default_factory=dict)
    status: Literal["queued", "done", "failed"] = "queued"
    error: Optional[str] = None


class Run(BaseModel):
    run_id: str = Field(default_factory=lambda: uuid.uuid4().hex)
    goal: str
    status: Literal["running", "done", "failed"] = "running"
    summary: str = ""
    events: list[Event] = Field(default_factory=list)
    tasks: list[Task] = Field(default_factory=list)
