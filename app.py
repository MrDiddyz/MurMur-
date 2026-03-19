from __future__ import annotations

from enum import Enum
from typing import Any, Dict, Optional, List
from datetime import datetime, timezone
from uuid import uuid4

from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

app = FastAPI(title="Artist Dev Orchestrator", version="0.1.0")

# ----------------------------
# State machine
# ----------------------------

class RunState(str, Enum):
    RECEIVED = "RECEIVED"
    CONTEXT_ASSEMBLED = "CONTEXT_ASSEMBLED"
    PLAN_CREATED = "PLAN_CREATED"
    AGENTS_RUNNING = "AGENTS_RUNNING"
    EVALUATING = "EVALUATING"
    NEEDS_HUMAN_REVIEW = "NEEDS_HUMAN_REVIEW"
    REVISING = "REVISING"
    APPROVED = "APPROVED"
    COMMITTED = "COMMITTED"
    SCHEDULED = "SCHEDULED"
    EXECUTED = "EXECUTED"
    MEASURING = "MEASURING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    CANCELLED = "CANCELLED"

def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()

# ----------------------------
# Models (API contracts)
# ----------------------------

class AttachmentRef(BaseModel):
    id: str
    kind: str = Field(..., description="audio|doc|image|link|other")
    url: str
    sha256: Optional[str] = None

class CreateRunRequest(BaseModel):
    userId: str
    orgId: Optional[str] = None
    projectId: Optional[str] = None
    text: str
    locale: Optional[str] = "en"
    attachments: Optional[List[AttachmentRef]] = None
    metadata: Optional[Dict[str, Any]] = None

class RunResponse(BaseModel):
    runId: str
    state: RunState
    createdAt: str
    updatedAt: str
    request: Dict[str, Any]
    finalOutput: Optional[Dict[str, Any]] = None
    evaluation: Optional[Dict[str, Any]] = None
    error: Optional[Dict[str, Any]] = None

class ApproveRequest(BaseModel):
    reviewerId: str

class DenyRequest(BaseModel):
    reviewerId: str
    reason: str

class IntegrationEvent(BaseModel):
    type: str
    occurredAt: Optional[str] = None
    runId: Optional[str] = None
    payload: Dict[str, Any] = Field(default_factory=dict)


class AvatarTask(str, Enum):
    CONTENT_CREATOR = "content_creator"
    OFFER_SELLER = "offer_seller"
    DECISION_ENGINE = "decision_engine"
    DAILY_OPERATOR = "daily_operator"


class AvatarOperateRequest(BaseModel):
    avatar_core: Dict[str, Any]
    context: Dict[str, Any]
    memory: Dict[str, Any]
    task: AvatarTask
    constraints: Dict[str, Any]
    telemetry: Dict[str, Any]



def _base_avatar_output(task: AvatarTask) -> Dict[str, Any]:
    return {
        "task": task.value,
        "version": "1.0",
        "assumptions": [],
        "outputs": {"content": [], "dm_replies": [], "decisions": [], "ops": []},
        "events": ["avatar.run.completed"],
        "quality": {"style_score": 90, "brand_risk": "low", "notes": ["AvatarCore respected as source of truth."]},
    }


def _validate_avatar_core(avatar_core: Dict[str, Any]) -> None:
    if not avatar_core:
        raise HTTPException(status_code=400, detail="avatar_core is required and cannot be empty")


def _avatar_content_creator(payload: Dict[str, Any]) -> None:
    payload["outputs"]["content"] = [
        {
            "format": "post",
            "copy": "Value-led post draft aligned with AvatarCore voice and campaign context.",
            "cta_variations": ["Reply \"PLAN\"", "Comment your biggest blocker", "DM for details"],
        }
    ]


def _avatar_offer_seller(payload: Dict[str, Any]) -> None:
    payload["outputs"]["dm_replies"] = [
        {
            "short": "Great question—want the 2-step version?",
            "medium": "Happy to help. Based on your goal, the fastest next step is a short diagnostic and one focused offer.",
            "long": "Thanks for sharing context. To keep this practical, I recommend we map one immediate win and one measurable milestone before expanding scope.",
            "next_step_question": "What outcome do you want in the next 14 days?",
        }
    ]


def _avatar_decision_engine(payload: Dict[str, Any]) -> None:
    payload["outputs"]["decisions"] = [
        {
            "priority_order": ["Scale current winner", "Ship one experiment", "Tighten follow-up loop"],
            "not_to_do": ["Launch a new offer without signal", "Change voice/style outside AvatarCore"],
        }
    ]


def _avatar_daily_operator(payload: Dict[str, Any]) -> None:
    payload["outputs"]["ops"] = [
        {
            "run_plan": ["Review KPIs", "Queue today's content", "Handle inbound DMs", "Log learnings"],
            "queue_items": ["1 primary post", "3 story frames", "5 DM follow-ups"],
            "analysis": "Maintain current winning angle and test one CTA variable.",
            "next_experiments": ["Hook variant A/B", "CTA tone test"],
        }
    ]


def run_avatar_operator(req: AvatarOperateRequest) -> Dict[str, Any]:
    _validate_avatar_core(req.avatar_core)
    payload = _base_avatar_output(req.task)

    if req.task == AvatarTask.CONTENT_CREATOR:
        _avatar_content_creator(payload)
    elif req.task == AvatarTask.OFFER_SELLER:
        _avatar_offer_seller(payload)
    elif req.task == AvatarTask.DECISION_ENGINE:
        _avatar_decision_engine(payload)
    elif req.task == AvatarTask.DAILY_OPERATOR:
        _avatar_daily_operator(payload)

    return payload

# ----------------------------
# In-memory "DB" (swap later)
# ----------------------------

RUNS: Dict[str, Dict[str, Any]] = {}

def save_run(run: Dict[str, Any]) -> None:
    run["updatedAt"] = now_iso()
    RUNS[run["runId"]] = run

def get_run_or_404(run_id: str) -> Dict[str, Any]:
    run = RUNS.get(run_id)
    if not run:
        raise HTTPException(status_code=404, detail="Run not found")
    return run

# ----------------------------
# Minimal transition guards
# ----------------------------

ALLOWED_TRANSITIONS = {
    RunState.RECEIVED: {RunState.CONTEXT_ASSEMBLED, RunState.FAILED},
    RunState.CONTEXT_ASSEMBLED: {RunState.PLAN_CREATED, RunState.FAILED},
    RunState.PLAN_CREATED: {RunState.AGENTS_RUNNING, RunState.FAILED},
    RunState.AGENTS_RUNNING: {RunState.EVALUATING, RunState.FAILED},
    RunState.EVALUATING: {RunState.NEEDS_HUMAN_REVIEW, RunState.REVISING, RunState.APPROVED, RunState.FAILED},
    RunState.REVISING: {RunState.EVALUATING, RunState.FAILED},
    RunState.NEEDS_HUMAN_REVIEW: {RunState.APPROVED, RunState.FAILED},
    RunState.APPROVED: {RunState.COMMITTED, RunState.FAILED},
    RunState.COMMITTED: {RunState.SCHEDULED, RunState.COMPLETED, RunState.FAILED},
    RunState.SCHEDULED: {RunState.EXECUTED, RunState.FAILED},
    RunState.EXECUTED: {RunState.MEASURING, RunState.FAILED},
    RunState.MEASURING: {RunState.COMPLETED, RunState.FAILED},
}

def transition(run: Dict[str, Any], to_state: RunState) -> None:
    from_state = RunState(run["state"])
    allowed = ALLOWED_TRANSITIONS.get(from_state, set())
    if to_state not in allowed:
        raise HTTPException(
            status_code=409,
            detail=f"Invalid transition {from_state} -> {to_state}",
        )
    run["state"] = to_state.value
    save_run(run)

# ----------------------------
# Orchestrator core (stubbed)
# Replace these with your real context/plan/agents/eval logic
# ----------------------------

def build_context(run: Dict[str, Any]) -> Dict[str, Any]:
    return {"recentEvents": [], "artistProfile": {}, "constraints": {}, "retrievedDocs": []}

def create_plan(run: Dict[str, Any], context: Dict[str, Any]) -> Dict[str, Any]:
    # Very simple routing stub
    return {"route": "IndustryStrategyEngine", "approval": "AUTO", "risk": "LOW", "rubrics": ["alignment", "clarity", "risk"]}

def run_agents(run: Dict[str, Any], context: Dict[str, Any], plan: Dict[str, Any]) -> Dict[str, Any]:
    # Stub agent outputs (replace with LLM calls)
    return {"draft": {"tasks": [{"id": "task-1", "title": "Define artist manifesto", "week": 1}]}}

def evaluate_output(run: Dict[str, Any], draft: Dict[str, Any]) -> Dict[str, Any]:
    # Stub evaluation scoring
    return {"overall": 0.82, "flags": [], "recommendedAction": "approve"}

def assemble_final_output(run: Dict[str, Any], agent_result: Dict[str, Any]) -> Dict[str, Any]:
    return {"tasks": agent_result["draft"].get("tasks", []), "artifacts": []}

def commit(run: Dict[str, Any]) -> None:
    # Write to memory/tasks store later
    pass

def should_require_human_review(evaluation: Dict[str, Any], plan: Dict[str, Any]) -> bool:
    if plan.get("approval") == "HUMAN_REQUIRED":
        return True
    flags = evaluation.get("flags", [])
    return "human_review_needed" in flags or "medical_red_flag" in flags or "contract_legal" in flags

def orchestrate_sync(run: Dict[str, Any]) -> None:
    # v0 synchronous orchestrator — can later be background worker
    transition(run, RunState.CONTEXT_ASSEMBLED)
    run["context"] = build_context(run)

    transition(run, RunState.PLAN_CREATED)
    run["plan"] = create_plan(run, run["context"])

    transition(run, RunState.AGENTS_RUNNING)
    agent_result = run_agents(run, run["context"], run["plan"])
    run["agentOutputs"] = agent_result

    transition(run, RunState.EVALUATING)
    run["evaluation"] = evaluate_output(run, agent_result["draft"])

    run["finalOutput"] = assemble_final_output(run, agent_result)

    if should_require_human_review(run["evaluation"], run["plan"]):
        transition(run, RunState.NEEDS_HUMAN_REVIEW)
        return

    transition(run, RunState.APPROVED)
    transition(run, RunState.COMMITTED)
    commit(run)

    # Optional scheduling decision
    # transition(run, RunState.SCHEDULED)

    transition(run, RunState.COMPLETED)

# ----------------------------
# Routes
# ----------------------------

@app.post("/v1/runs", response_model=RunResponse)
def create_run(req: CreateRunRequest):
    run_id = str(uuid4())
    run = {
        "runId": run_id,
        "state": RunState.RECEIVED.value,
        "createdAt": now_iso(),
        "updatedAt": now_iso(),
        "request": req.model_dump(),
        "finalOutput": None,
        "evaluation": None,
        "error": None,
    }
    save_run(run)

    # For MVP: do it sync (instant). Later: enqueue to worker.
    try:
        orchestrate_sync(run)
    except HTTPException:
        raise
    except Exception as e:
        run["state"] = RunState.FAILED.value
        run["error"] = {"code": "UNHANDLED", "message": str(e)}
        save_run(run)

    return run

@app.get("/v1/runs/{run_id}", response_model=RunResponse)
def read_run(run_id: str):
    return get_run_or_404(run_id)

@app.post("/v1/runs/{run_id}/approve", response_model=RunResponse)
def approve_run(run_id: str, body: ApproveRequest):
    run = get_run_or_404(run_id)
    if RunState(run["state"]) != RunState.NEEDS_HUMAN_REVIEW:
        raise HTTPException(status_code=409, detail="Run is not awaiting human review")

    transition(run, RunState.APPROVED)
    transition(run, RunState.COMMITTED)
    commit(run)
    transition(run, RunState.COMPLETED)

    return run

@app.post("/v1/runs/{run_id}/deny", response_model=RunResponse)
def deny_run(run_id: str, body: DenyRequest):
    run = get_run_or_404(run_id)
    if RunState(run["state"]) != RunState.NEEDS_HUMAN_REVIEW:
        raise HTTPException(status_code=409, detail="Run is not awaiting human review")

    transition(run, RunState.FAILED)
    run["error"] = {"code": "HUMAN_DENIED", "message": body.reason, "reviewerId": body.reviewerId}
    save_run(run)
    return run

@app.post("/v1/events")
def ingest_event(evt: IntegrationEvent):
    # In production: validate signature + tenant boundaries
    if not evt.runId:
        return {"ok": True, "note": "Event accepted without runId"}

    run = get_run_or_404(evt.runId)
    t = evt.type

    # Drive transitions based on integration events
    if t == "social.post_published" and RunState(run["state"]) == RunState.SCHEDULED:
        transition(run, RunState.EXECUTED)

    if t == "analytics.streaming_ingested" and RunState(run["state"]) in {RunState.EXECUTED, RunState.SCHEDULED}:
        # allow direct measuring if you ingest metrics early
        if RunState(run["state"]) == RunState.SCHEDULED:
            transition(run, RunState.EXECUTED)
        transition(run, RunState.MEASURING)

    if t == "measurement.completed" and RunState(run["state"]) == RunState.MEASURING:
        transition(run, RunState.COMPLETED)

    # Store event in run (for MVP)
    run.setdefault("events", []).append(evt.model_dump())
    save_run(run)

    return {"ok": True, "runId": evt.runId, "state": run["state"]}


@app.post("/v1/avatar/operate")
def avatar_operate(req: AvatarOperateRequest):
    return run_avatar_operator(req)

# Run: uvicorn app:app --reload
