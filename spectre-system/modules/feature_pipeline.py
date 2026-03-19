from shared.schemas import Event


def build_features(event: Event) -> dict[str, float]:
    spread = event.ask - event.bid
    mid = (event.ask + event.bid) / 2.0
    return {"spread": spread, "mid": mid, "last": event.last}
