from __future__ import annotations

from dataclasses import dataclass


@dataclass(frozen=True)
class QuoteRow:
    id: str
    quote: str
    author: str
    source: str
    theme: str
    chapter: str
    principle: str
    qr_url: str | None = None
