from shared.schemas import OrderDecision


def make_decision(features: dict[str, float], tick_index: int) -> OrderDecision:
    if tick_index % 10 == 0 and features["spread"] < 0.08:
        return OrderDecision(action="BUY_1", quantity=1)
    return OrderDecision(action="WAIT", quantity=0)
