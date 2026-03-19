from shared.schemas import Event, Fill, PortfolioState


class Portfolio:
    def __init__(self, initial_cash: float = 100000.0) -> None:
        self.cash = initial_cash
        self.position = 0
        self.last_mid = 0.0

    def apply_fill(self, fill: Fill | None) -> None:
        if fill is None:
            return
        if fill.side == "BUY":
            self.cash -= fill.price * fill.quantity
            self.position += fill.quantity
        else:
            self.cash += fill.price * fill.quantity
            self.position -= fill.quantity

    def mark(self, event: Event) -> PortfolioState:
        self.last_mid = (event.bid + event.ask) / 2.0
        pnl = self.cash + (self.position * self.last_mid) - 100000.0
        return PortfolioState(cash=self.cash, position=self.position, last_mid=self.last_mid, pnl=pnl)
