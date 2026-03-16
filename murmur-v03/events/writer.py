from datetime import datetime, timezone

from sqlalchemy import func, select

from core.projections import apply_projection
from storage.models import Event


class EventWriter:
    def __init__(self, session):
        self.session = session

    def next_seq(self, run_id: str) -> int:
        current = self.session.scalar(select(func.max(Event.seq)).where(Event.run_id == run_id))
        return (current or 0) + 1

    def append(self, envelope):
        item = Event(
            event_id=envelope.event_id,
            job_id=envelope.job_id,
            run_id=envelope.run_id,
            seq=envelope.seq,
            type=envelope.type,
            timestamp=envelope.timestamp or datetime.now(timezone.utc),
            version=envelope.version,
            actor=envelope.actor,
            payload_json=envelope.payload,
            meta_json=envelope.meta,
        )
        self.session.add(item)
        apply_projection(self.session, item)
        self.session.flush()
        return item
