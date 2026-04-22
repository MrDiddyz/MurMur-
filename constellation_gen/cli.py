from __future__ import annotations

import argparse
from pathlib import Path

from .config import load_config
from .layout import ring_layout_by_theme
from .parsing import parse_quote_rows
from .render import render_html, render_png, render_svg


def parse_links(path: str | None) -> list[tuple[str, str]]:
    if not path:
        return []
    links: list[tuple[str, str]] = []
    for raw in Path(path).read_text(encoding="utf-8").splitlines():
        line = raw.strip()
        if not line or line.startswith("#"):
            continue
        source, _, target = line.partition(",")
        if source and target:
            links.append((source.strip(), target.strip()))
    return links


def build_parser() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(description="Generate constellation knowledge maps")
    parser.add_argument("--csv", required=True, help="Input quotes CSV")
    parser.add_argument("--config", required=True, help="YAML config")
    parser.add_argument("--links", help="Optional links file with source,target per line")
    parser.add_argument("--output-prefix", default="constellation-map", help="Output filename prefix")
    return parser


def main(argv: list[str] | None = None) -> int:
    args = build_parser().parse_args(argv)
    config = load_config(args.config)
    rows = parse_quote_rows(args.csv)
    links = parse_links(args.links)
    positions = ring_layout_by_theme(rows, width=config.map.width, height=config.map.height)

    png_path = f"{args.output_prefix}.png"
    render_png(rows, positions, links, config, png_path)

    if config.map.export.svg or config.map.export.html:
        svg_path = f"{args.output_prefix}.svg"
        svg = render_svg(rows, positions, links, config, svg_path)
        if config.map.export.html:
            render_html(svg, rows, f"{args.output_prefix}.html")

    return 0


if __name__ == "__main__":
    raise SystemExit(main())
