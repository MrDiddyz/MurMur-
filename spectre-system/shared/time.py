from datetime import datetime, timedelta, timezone


def deterministic_timestamps(event_time: datetime, tick_index: int) -> tuple[datetime, datetime]:
    if event_time.tzinfo is None:
        event_time = event_time.replace(tzinfo=timezone.utc)
    arrival = event_time + timedelta(milliseconds=1)
    processing = arrival + timedelta(milliseconds=(tick_index % 3) + 1)
    return arrival, processing
