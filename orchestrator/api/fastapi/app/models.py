from typing import Any
from uuid import UUID

from pydantic import BaseModel, Field


class CreateRunRequest(BaseModel):
    user_id: UUID
    org_id: UUID | None = None
    project_id: UUID | None = None
    request_text: str
    request_locale: str | None = "en"
    request_json: dict[str, Any] = Field(default_factory=dict)


class DecisionRequest(BaseModel):
    reviewer_id: UUID | None = None
    reason: str | None = None


class CreateEventRequest(BaseModel):
    run_id: UUID | None = None
    to_state: str | None = None
    type: str
    actor: str = "system"
    payload: dict[str, Any] = Field(default_factory=dict)
    source: str | None = None
    source_event_id: str | None = None
