from shared.schemas import Event


def build_features(event: Event) -> dict[str, float]:
    spread = max(0.0, event.ask - event.bid)  # Guard: spread can never be negative
    if event.ask <= 0 or event.bid <= 0:
        raise ValueError(f"Invalid tick prices: bid={event.bid}, ask={event.ask}")
    mid = (event.ask + event.bid) / 2.0
    return {"spread": spread, "mid": mid, "last": event.last}
