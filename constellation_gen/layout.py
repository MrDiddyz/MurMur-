from __future__ import annotations

import math
from collections import defaultdict

from .models import QuoteRow


def ring_layout_by_theme(
    rows: list[QuoteRow],
    *,
    width: int,
    height: int,
    inner_radius: float = 180.0,
    ring_gap: float = 220.0,
) -> dict[str, tuple[float, float]]:
    """Return map positions keyed by row id, grouped in concentric rings by theme."""
    if not rows:
        return {}

    themes = sorted({row.theme for row in rows})
    theme_idx = {theme: idx for idx, theme in enumerate(themes)}

    rows_by_theme: dict[str, list[QuoteRow]] = defaultdict(list)
    for row in rows:
        rows_by_theme[row.theme].append(row)

    cx, cy = width / 2.0, height / 2.0
    positions: dict[str, tuple[float, float]] = {}

    for theme, group in rows_by_theme.items():
        radius = inner_radius + (theme_idx[theme] * ring_gap)
        count = len(group)
        for index, row in enumerate(sorted(group, key=lambda r: (r.chapter, r.id))):
            angle = (2 * math.pi * index / max(1, count)) + (theme_idx[theme] * 0.35)
            x = cx + (radius * math.cos(angle))
            y = cy + (radius * math.sin(angle))
            positions[row.id] = (x, y)

    return positions


def chapter_bounds(
    rows: list[QuoteRow],
    positions: dict[str, tuple[float, float]],
    padding: float,
) -> dict[str, tuple[float, float, float, float]]:
    by_chapter: dict[str, list[tuple[float, float]]] = defaultdict(list)
    for row in rows:
        if row.id in positions:
            by_chapter[row.chapter].append(positions[row.id])

    bounds: dict[str, tuple[float, float, float, float]] = {}
    for chapter, points in by_chapter.items():
        xs = [p[0] for p in points]
        ys = [p[1] for p in points]
        bounds[chapter] = (
            min(xs) - padding,
            min(ys) - padding,
            max(xs) + padding,
            max(ys) + padding,
        )
    return bounds
