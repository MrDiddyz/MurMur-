from __future__ import annotations

from html import escape
from pathlib import Path

from .config import AppConfig
from .layout import chapter_bounds
from .models import QuoteRow


def _principle_color(config: AppConfig, principle: str) -> str:
    return config.map.principle_colors.get(principle, config.map.default_principle_color)


def render_png(
    rows: list[QuoteRow],
    positions: dict[str, tuple[float, float]],
    links: list[tuple[str, str]],
    config: AppConfig,
    out_path: str | Path,
) -> None:
    from PIL import Image, ImageDraw, ImageFont

    image = Image.new("RGBA", (config.map.width, config.map.height), config.map.background_color)
    draw = ImageDraw.Draw(image, "RGBA")

    for chapter, (x0, y0, x1, y1) in chapter_bounds(
        rows, positions, config.map.cluster.halo_padding
    ).items():
        draw.rounded_rectangle(
            (x0, y0, x1, y1),
            radius=28,
            outline=(148, 163, 184, 180),
            width=config.map.cluster.border_width,
            fill=(148, 163, 184, config.map.cluster.halo_alpha),
        )
        draw.text((x0 + 10, y0 + 8), chapter, fill=config.map.text_color)

    for source, target in links:
        if source in positions and target in positions:
            draw.line((positions[source], positions[target]), fill=config.map.edge_color, width=2)

    for row in rows:
        if row.id not in positions:
            continue
        x, y = positions[row.id]
        draw.ellipse((x - 9, y - 9, x + 9, y + 9), fill=_principle_color(config, row.principle))
        draw.text((x + 12, y - 8), row.quote[:28], fill=config.map.text_color)

    draw.text((42, 26), config.title, fill=config.map.text_color, font=ImageFont.load_default())
    image.save(out_path, format="PNG")


def build_svg(
    rows: list[QuoteRow],
    positions: dict[str, tuple[float, float]],
    links: list[tuple[str, str]],
    config: AppConfig,
) -> str:
    parts: list[str] = [
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{config.map.width}" height="{config.map.height}" viewBox="0 0 {config.map.width} {config.map.height}">',
        f'<rect width="100%" height="100%" fill="{escape(config.map.background_color)}"/>',
        f'<text x="36" y="42" fill="{escape(config.map.text_color)}" font-size="24">{escape(config.title)}</text>',
    ]

    for source, target in links:
        if source in positions and target in positions:
            sx, sy = positions[source]
            tx, ty = positions[target]
            parts.append(
                f'<line x1="{sx:.2f}" y1="{sy:.2f}" x2="{tx:.2f}" y2="{ty:.2f}" stroke="{escape(config.map.edge_color)}" stroke-width="1.4"/>'
            )

    for row in rows:
        if row.id not in positions:
            continue
        x, y = positions[row.id]
        color = _principle_color(config, row.principle)
        label = escape(row.quote[:35])
        title = escape(row.quote)
        parts.append(
            f'<g class="node" data-id="{escape(row.id)}" data-theme="{escape(row.theme)}" data-chapter="{escape(row.chapter)}" data-principle="{escape(row.principle)}">'
            f'<circle cx="{x:.2f}" cy="{y:.2f}" r="8" fill="{escape(color)}"><title>{title}</title></circle>'
            f'<text x="{x + 12:.2f}" y="{y + 4:.2f}" fill="{escape(config.map.text_color)}" font-size="12">{label}</text>'
            "</g>"
        )

    parts.append("</svg>")
    return "\n".join(parts)


def render_svg(
    rows: list[QuoteRow],
    positions: dict[str, tuple[float, float]],
    links: list[tuple[str, str]],
    config: AppConfig,
    out_path: str | Path,
) -> str:
    svg = build_svg(rows, positions, links, config)
    Path(out_path).write_text(svg, encoding="utf-8")
    return svg


def render_html(svg: str, rows: list[QuoteRow], out_path: str | Path) -> None:
    themes = sorted({row.theme for row in rows})
    chapters = sorted({row.chapter for row in rows})
    theme_buttons = "".join(
        f'<button data-filter="theme" data-value="{escape(theme)}">{escape(theme)}</button>' for theme in themes
    )
    chapter_buttons = "".join(
        f'<button data-filter="chapter" data-value="{escape(chapter)}">{escape(chapter)}</button>'
        for chapter in chapters
    )

    html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset=\"utf-8\" />
<title>Constellation Knowledge Map</title>
<style>
body {{ background:#030712; color:#e5e7eb; font-family:Inter,system-ui,sans-serif; }}
button {{ background:#111827; color:#e5e7eb; border:1px solid #374151; margin:0 6px 6px 0; padding:6px 10px; }}
.node.hidden {{ opacity:.08; }}
#tooltip {{ position:fixed; background:#111827; border:1px solid #374151; padding:6px 8px; display:none; pointer-events:none; }}
</style>
</head>
<body>
<div><strong>Themes</strong> {theme_buttons}</div>
<div><strong>Chapters</strong> {chapter_buttons}</div>
<div id=\"map\">{svg}</div>
<div id=\"tooltip\"></div>
<script>
const tooltip=document.getElementById('tooltip');
document.querySelectorAll('.node').forEach(n=>{{
  n.addEventListener('mousemove',e=>{{ tooltip.style.display='block'; tooltip.style.left=(e.clientX+10)+'px'; tooltip.style.top=(e.clientY+10)+'px'; tooltip.textContent=n.dataset.theme+' / '+n.dataset.chapter+' / '+n.dataset.principle; }});
  n.addEventListener('mouseleave',()=>tooltip.style.display='none');
}});
document.querySelectorAll('button[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{{
  const key=btn.dataset.filter; const value=btn.dataset.value;
  document.querySelectorAll('.node').forEach(n=>n.classList.toggle('hidden', n.dataset[key]!==value));
}}));
</script>
</body>
</html>"""
    Path(out_path).write_text(html, encoding="utf-8")
