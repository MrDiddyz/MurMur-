from typing import Any
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, field_validator


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

    @field_validator("to_state", mode="before")
    @classmethod
    def validate_to_state(cls, v: object) -> object:
        valid = set(RunState.__args__)  # type: ignore[attr-defined]
        if v not in valid:
            raise ValueError(
                f"Invalid to_state '{v}'. Must be one of: {', '.join(sorted(valid))}"
            )
        return v

    @field_validator("event_type")
    @classmethod
    def validate_event_type(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("event_type cannot be empty")
        return v.strip()
