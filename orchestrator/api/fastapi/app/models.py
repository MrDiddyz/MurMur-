from typing import Any
from typing import Literal
from uuid import UUID

from pydantic import BaseModel


RunState = Literal[
    "RECEIVED",
    "CONTEXT_ASSEMBLED",
    "PLAN_CREATED",
    "AGENTS_RUNNING",
    "EVALUATING",
    "NEEDS_HUMAN_REVIEW",
    "REVISING",
    "APPROVED",
    "COMMITTED",
    "SCHEDULED",
    "EXECUTED",
    "MEASURING",
    "COMPLETED",
    "FAILED",
    "CANCELLED",
]


class CreateRunRequest(BaseModel):
    user_id: str
    org_id: str | None = None
    project_id: str | None = None
    request_text: str
    request_locale: str | None = "en"
    request_json: dict[str, Any] | None = None


class TransitionRequest(BaseModel):
    actor: str | None = "system"
    payload: dict[str, Any] | None = None


class EventRequest(BaseModel):
    run_id: UUID
    to_state: RunState
    event_type: str
    actor: str | None = "system"
    payload: dict[str, Any] | None = None
