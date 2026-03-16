
def evaluate(decision_text: str):
    base = (sum(ord(c) for c in decision_text) % 100) / 100
    score = round(0.5 + (base / 2), 2)
    subs = {
        "clarity": round(score - 0.05, 2),
        "actionability": score,
        "structure": round(score - 0.03, 2),
        "efficiency": round(score - 0.02, 2),
        "outcome": round(score - 0.01, 2),
    }
    return {
        "score": score,
        "rubric_version": "reward_v1",
        "subscores": subs,
        "notes": "Deterministic mock evaluation.",
    }
