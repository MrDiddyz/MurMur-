from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


class RunCreateRequest(BaseModel):
    user_id: UUID
    org_id: UUID | None = None
    project_id: UUID | None = None
    request_text: str
    request_locale: str | None = None
    request_json: dict[str, Any] = Field(default_factory=dict)


class EventTransitionRequest(BaseModel):
    run_id: UUID
    to_state: str
    event_type: str
    actor: str = "system"
    payload: dict[str, Any] = Field(default_factory=dict)


class ApprovalDecisionRequest(BaseModel):
    reviewer_id: UUID | None = None
    reason: str | None = None
