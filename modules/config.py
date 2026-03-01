from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class Theme:
    background: str
    accent: str
    soft: str


@dataclass(frozen=True)
class Branding:
    symbol: str
    footer_left: str
    footer_right_prefix: str


@dataclass(frozen=True)
class Fonts:
    quote: str
    ui: str


@dataclass(frozen=True)
class Sizes:
    quote: int
    subtitle: int
    footer: int


@dataclass(frozen=True)
class Layout:
    line_spacing: int
    quote_y_ratio: float
    subtitle_gap: int
    footer_y_offset: int


@dataclass(frozen=True)
class Effects:
    glow: bool
    glow_radius: int
    glow_strength: int


@dataclass(frozen=True)
class Canvas:
    size: int
    margin: int


@dataclass(frozen=True)
class AppConfig:
    canvas: Canvas
    theme: Theme
    branding: Branding
    fonts: Fonts
    sizes: Sizes
    layout: Layout
    effects: Effects


def _require(d: dict[str, Any], key: str) -> Any:
    if key not in d:
        raise KeyError(f"Missing config key: {key}")
    return d[key]


def _require_section(cfg: dict[str, Any], key: str) -> dict[str, Any]:
    section = _require(cfg, key)
    if not isinstance(section, dict):
        raise TypeError(f"Config section '{key}' must be a mapping")
    return section


def _parse_bool(value: Any, *, key: str) -> bool:
    if isinstance(value, bool):
        return value

    if isinstance(value, str):
        normalized = value.strip().lower()
        if normalized in {"true", "1", "yes", "on"}:
            return True
        if normalized in {"false", "0", "no", "off"}:
            return False

    if isinstance(value, int):
        if value == 1:
            return True
        if value == 0:
            return False

    raise TypeError(f"Config key '{key}' must be a boolean")


def _load_yaml(path: Path) -> Any:
    try:
        import yaml
    except ModuleNotFoundError as exc:
        raise ModuleNotFoundError(
            "PyYAML is required to load YAML config files. Install dependency 'pyyaml'."
        ) from exc

    with path.open("r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def load_config(path: str) -> AppConfig:
    config_path = Path(path)
    if not config_path.exists():
        raise FileNotFoundError(f"Config not found: {path}")
    if config_path.is_dir():
        raise IsADirectoryError(f"Config path points to a directory: {path}")

    cfg = _load_yaml(config_path)

    if not isinstance(cfg, dict):
        raise TypeError("Root config must be a mapping")

    canvas = _require_section(cfg, "canvas")
    theme = _require_section(cfg, "theme")
    branding = _require_section(cfg, "branding")
    fonts = _require_section(cfg, "fonts")
    sizes = _require_section(cfg, "sizes")
    layout = _require_section(cfg, "layout")
    effects = _require_section(cfg, "effects")

    return AppConfig(
        canvas=Canvas(size=int(_require(canvas, "size")), margin=int(_require(canvas, "margin"))),
        theme=Theme(
            background=str(_require(theme, "background")),
            accent=str(_require(theme, "accent")),
            soft=str(_require(theme, "soft")),
        ),
        branding=Branding(
            symbol=str(_require(branding, "symbol")),
            footer_left=str(_require(branding, "footer_left")),
            footer_right_prefix=str(_require(branding, "footer_right_prefix")),
        ),
        fonts=Fonts(
            quote=str(_require(fonts, "quote")),
            ui=str(_require(fonts, "ui")),
        ),
        sizes=Sizes(
            quote=int(_require(sizes, "quote")),
            subtitle=int(_require(sizes, "subtitle")),
            footer=int(_require(sizes, "footer")),
        ),
        layout=Layout(
            line_spacing=int(_require(layout, "line_spacing")),
            quote_y_ratio=float(_require(layout, "quote_y_ratio")),
            subtitle_gap=int(_require(layout, "subtitle_gap")),
            footer_y_offset=int(_require(layout, "footer_y_offset")),
        ),
        effects=Effects(
            glow=_parse_bool(_require(effects, "glow"), key="effects.glow"),
            glow_radius=int(_require(effects, "glow_radius")),
            glow_strength=int(_require(effects, "glow_strength")),
        ),
    )
