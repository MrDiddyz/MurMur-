from __future__ import annotations

import csv
from pathlib import Path
from typing import Iterable

from .models import QuoteRow


_REQUIRED_COLUMNS = (
    "id",
    "quote",
    "author",
    "source",
    "theme",
    "chapter",
    "principle",
)


def _require(row: dict[str, str], key: str) -> str:
    value = (row.get(key) or "").strip()
    if not value:
        raise ValueError(f"Missing required CSV value '{key}' for id={row.get('id', '<missing>')}")
    return value


def parse_quote_rows(csv_path: str | Path) -> list[QuoteRow]:
    path = Path(csv_path)
    if not path.exists():
        raise FileNotFoundError(f"CSV file not found: {path}")

    with path.open("r", encoding="utf-8", newline="") as handle:
        reader = csv.DictReader(handle)
        missing = [column for column in _REQUIRED_COLUMNS if column not in (reader.fieldnames or [])]
        if missing:
            raise ValueError(f"CSV missing required columns: {', '.join(missing)}")

        rows: list[QuoteRow] = []
        for row in reader:
            rows.append(
                QuoteRow(
                    id=_require(row, "id"),
                    quote=_require(row, "quote"),
                    author=_require(row, "author"),
                    source=_require(row, "source"),
                    theme=_require(row, "theme"),
                    chapter=_require(row, "chapter"),
                    principle=_require(row, "principle"),
                    qr_url=(row.get("qr_url") or "").strip() or None,
                )
            )
    return rows


def group_by_theme(rows: Iterable[QuoteRow]) -> dict[str, list[QuoteRow]]:
    grouped: dict[str, list[QuoteRow]] = {}
    for row in rows:
        grouped.setdefault(row.theme, []).append(row)
    return grouped


def group_by_chapter(rows: Iterable[QuoteRow]) -> dict[str, list[QuoteRow]]:
    grouped: dict[str, list[QuoteRow]] = {}
    for row in rows:
        grouped.setdefault(row.chapter, []).append(row)
    return grouped
