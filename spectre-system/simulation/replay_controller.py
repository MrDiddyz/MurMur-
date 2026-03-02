import csv
from datetime import datetime
from pathlib import Path

from shared.schemas import Event
from shared.time import deterministic_timestamps


def load_events(csv_path: str) -> list[Event]:
    path = Path(csv_path)
    if not path.exists():
        raise FileNotFoundError(f"Missing data file: {csv_path}")

    events: list[Event] = []
    with path.open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        required = {"event_time", "symbol", "bid", "ask", "last", "volume"}
        if set(reader.fieldnames or []) != required:
            raise ValueError(f"CSV headers must match exactly: {sorted(required)}")
        for idx, row in enumerate(reader):
            try:
                event_time = datetime.fromisoformat(row["event_time"])
                arrival_time, processing_time = deterministic_timestamps(event_time, idx)
                events.append(
                    Event(
                        symbol=row["symbol"],
                        bid=float(row["bid"]),
                        ask=float(row["ask"]),
                        last=float(row["last"]),
                        volume=int(row["volume"]),
                        event_time=event_time,
                        arrival_time=arrival_time,
                        processing_time=processing_time,
                    )
                )
            except Exception as exc:  # fail fast on invalid rows
                raise ValueError(f"Invalid row {idx + 1}: {row}") from exc

    events.sort(key=lambda item: item.event_time)
    return events
