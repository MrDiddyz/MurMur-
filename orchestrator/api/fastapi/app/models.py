from typing import Any
from pydantic import BaseModel


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
    run_id: str
    to_state: str
    event_type: str
    actor: str | None = "system"
    payload: dict[str, Any] | None = None
