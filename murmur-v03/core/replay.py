from events import types


def initial_state(job_id: str, run_id: str):
    return {
        "job_id": job_id,
        "run_id": run_id,
        "status": "queued",
        "task": "",
        "context": {},
        "selected_council": {},
        "selected_strategy": {},
        "agents": [],
        "tool_calls": [],
        "decision": {},
        "evaluation": {},
    }


def fold(event, state):
    t = event.type
    p = event.payload_json
    if t == types.TASK_RECEIVED:
        state["task"] = p.get("task", "")
        state["context"] = p.get("context", {})
        state["status"] = "queued"
    elif t == types.RUN_STARTED:
        state["status"] = "running"
    elif t == types.COUNCIL_SELECTED:
        state["selected_council"] = p
    elif t == types.STRATEGY_SELECTED:
        state["selected_strategy"] = p
    elif t == types.AGENT_OUTPUT_RECORDED:
        state["agents"].append(p)
    elif t in (types.TOOL_CALL_REQUESTED, types.TOOL_CALL_COMPLETED, types.TOOL_CALL_REJECTED):
        state["tool_calls"].append({"type": t, **p})
    elif t == types.SYNTHESIS_GENERATED:
        state["decision"] = p
    elif t == types.EVALUATION_COMPLETED:
        state["evaluation"] = p
    elif t == types.RUN_COMPLETED:
        state["status"] = "succeeded"
    elif t == types.RUN_FAILED:
        state["status"] = "failed"
    return state


def replay(job_id: str, run_id: str, events):
    state = initial_state(job_id, run_id)
    for event in sorted(events, key=lambda x: x.seq):
        state = fold(event, state)
    return state
