from __future__ import annotations

import time
import uuid
from dataclasses import dataclass, field


@dataclass
class TraceSpan:
    run_id: str
    name: str
    started_at: float = field(default_factory=time.perf_counter)
    ended_at: float | None = None
    latency_ms: float | None = None
    parent_span_id: str | None = None
    span_id: str = field(default_factory=lambda: uuid.uuid4().hex)
    meta: dict = field(default_factory=dict)

    def finish(self) -> "TraceSpan":
        self.ended_at = time.perf_counter()
        self.latency_ms = round((self.ended_at - self.started_at) * 1000, 3)
        return self

    def as_record(self) -> dict:
        return {
            "span_id": self.span_id,
            "run_id": self.run_id,
            "name": self.name,
            "latency_ms": self.latency_ms,
            "parent_span_id": self.parent_span_id,
            "meta": self.meta,
        }
