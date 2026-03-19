from typing import Any

from pydantic import BaseModel, Field


class JobRequest(BaseModel):
    task: str
    context: dict[str, Any] = Field(default_factory=dict)
    mode: str = "auto"
    council: list[str] = Field(default_factory=list)
    allow_tools: list[str] = Field(default_factory=list)
    strategy_id: str | None = None
