from datetime import datetime

import pytest
from pydantic import ValidationError

from shared.schemas import Event


def test_event_schema_requires_minimum_fields() -> None:
    event = Event(
        symbol="SPY",
        bid=100.0,
        ask=100.05,
        last=100.02,
        volume=10,
        event_time=datetime.fromisoformat("2024-01-02T09:30:00"),
        arrival_time=datetime.fromisoformat("2024-01-02T09:30:00.001"),
        processing_time=datetime.fromisoformat("2024-01-02T09:30:00.002"),
    )
    assert event.symbol == "SPY"


def test_event_schema_rejects_invalid_prices() -> None:
    with pytest.raises(ValidationError):
        Event(
            symbol="SPY",
            bid=-1.0,
            ask=100.05,
            last=100.02,
            volume=10,
            event_time=datetime.fromisoformat("2024-01-02T09:30:00"),
            arrival_time=datetime.fromisoformat("2024-01-02T09:30:00.001"),
            processing_time=datetime.fromisoformat("2024-01-02T09:30:00.002"),
        )
