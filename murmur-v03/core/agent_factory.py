from core.council import COUNCIL_CATALOG


def select_council(task: str):
    text = task.lower()
    if any(k in text for k in ["risk", "security", "failure"]):
        cid = "risk_heavy"
        rationale = "Task contains risk-oriented keywords."
    elif any(k in text for k in ["build", "implement", "code"]):
        cid = "build_heavy"
        rationale = "Task emphasizes implementation and build execution."
    else:
        cid = "default"
        rationale = "Fallback deterministic council."
    return cid, COUNCIL_CATALOG[cid], rationale
