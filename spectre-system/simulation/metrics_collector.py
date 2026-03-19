from shared.schemas import PortfolioState


class MetricsCollector:
    def __init__(self) -> None:
        self.ticks_processed = 0
        self.orders_filled = 0

    def on_tick(self) -> None:
        self.ticks_processed += 1

    def on_fill(self, filled: bool) -> None:
        if filled:
            self.orders_filled += 1

    def final_summary(self, portfolio: PortfolioState) -> dict[str, float | int]:
        return {
            "ticks_processed": self.ticks_processed,
            "orders_filled": self.orders_filled,
            "final_cash": round(portfolio.cash, 4),
            "final_position": portfolio.position,
            "final_pnl": round(portfolio.pnl, 4),
        }
