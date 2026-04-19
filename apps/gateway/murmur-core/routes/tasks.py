import uuid
from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, Depends
from pydantic import BaseModel

from auth import require_api_key_with_scope
from queue import enqueue_task

router = APIRouter(prefix="/tasks", tags=["tasks"])


class TaskCreateRequest(BaseModel):
    type: str
    payload: dict[str, Any] = {}


@router.post("")
def create_task(
    req: TaskCreateRequest,
    auth=Depends(require_api_key_with_scope("tasks:write")),
):
    task = {
        "id": str(uuid.uuid4()),
        "type": req.type,
        "payload": req.payload,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "actor": auth.get("sub") or auth.get("client_id") or "unknown",
    }
    enqueue_task(task)
    return {"queued": True, "task": task}
