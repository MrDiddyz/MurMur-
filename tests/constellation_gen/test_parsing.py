from pathlib import Path

from constellation_gen.parsing import parse_quote_rows


def test_parse_quote_rows_supports_new_columns(tmp_path: Path) -> None:
    csv_path = tmp_path / "quotes.csv"
    csv_path.write_text(
        "id,quote,author,source,theme,chapter,principle,qr_url\n"
        "q1,Stay curious,Ada,Book A,Learning,Intro,Iteration,https://example.com/q1\n"
        "q2,Ship daily,Lin,Book B,Execution,Ch 1,Consistency,\n",
        encoding="utf-8",
    )

    rows = parse_quote_rows(csv_path)

    assert len(rows) == 2
    assert rows[0].theme == "Learning"
    assert rows[0].chapter == "Intro"
    assert rows[0].principle == "Iteration"
    assert rows[0].qr_url == "https://example.com/q1"
    assert rows[1].qr_url is None
