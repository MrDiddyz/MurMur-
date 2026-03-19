from shared.schemas import Event, Fill, OrderDecision


def execute(decision: OrderDecision, event: Event) -> Fill | None:
    if decision.action == "BUY_1" and decision.quantity > 0:
        return Fill(side="BUY", quantity=decision.quantity, price=event.ask)
    if decision.action == "SELL_1" and decision.quantity > 0:
        return Fill(side="SELL", quantity=decision.quantity, price=event.bid)
    return None
