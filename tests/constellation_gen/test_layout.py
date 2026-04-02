from constellation_gen.layout import ring_layout_by_theme
from constellation_gen.models import QuoteRow


def _row(i: int, theme: str, chapter: str) -> QuoteRow:
    return QuoteRow(
        id=f"q{i}",
        quote=f"quote {i}",
        author="author",
        source="source",
        theme=theme,
        chapter=chapter,
        principle="principle",
    )


def test_ring_layout_returns_positions_by_id() -> None:
    rows = [_row(1, "A", "1"), _row(2, "A", "2"), _row(3, "B", "1")]

    positions = ring_layout_by_theme(rows, width=1000, height=1000, inner_radius=100, ring_gap=100)

    assert set(positions.keys()) == {"q1", "q2", "q3"}
    assert all(isinstance(pos[0], float) and isinstance(pos[1], float) for pos in positions.values())


def test_ring_layout_places_different_themes_on_different_rings() -> None:
    rows = [_row(1, "A", "1"), _row(2, "B", "1")]
    positions = ring_layout_by_theme(rows, width=1000, height=1000, inner_radius=100, ring_gap=200)

    cx = cy = 500.0
    ax, ay = positions["q1"]
    bx, by = positions["q2"]
    ra = ((ax - cx) ** 2 + (ay - cy) ** 2) ** 0.5
    rb = ((bx - cx) ** 2 + (by - cy) ** 2) ** 0.5

    assert rb > ra
