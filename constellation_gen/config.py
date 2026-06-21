from __future__ import annotations

from dataclasses import dataclass, field
from pathlib import Path
from typing import Any


@dataclass(frozen=True)
class ClusterStyle:
    halo_alpha: int = 48
    halo_padding: float = 36.0
    label_size: int = 16
    border_width: int = 2


@dataclass(frozen=True)
class ExportMode:
    png: bool = True
    svg: bool = False
    html: bool = False


@dataclass(frozen=True)
class MapConfig:
    width: int = 2048
    height: int = 2048
    background_color: str = "#0D1117"
    edge_color: str = "#6B7280"
    text_color: str = "#E5E7EB"
    default_principle_color: str = "#60A5FA"
    principle_colors: dict[str, str] = field(default_factory=dict)
    cluster: ClusterStyle = field(default_factory=ClusterStyle)
    export: ExportMode = field(default_factory=ExportMode)


@dataclass(frozen=True)
class AppConfig:
    title: str = "Constellation Knowledge Map"
    map: MapConfig = field(default_factory=MapConfig)


def _parse_yaml(path: Path) -> dict[str, Any]:
    try:
        import yaml
    except ModuleNotFoundError as exc:
        raise ModuleNotFoundError("PyYAML is required for config loading.") from exc

    with path.open("r", encoding="utf-8") as handle:
        data = yaml.safe_load(handle) or {}
    if not isinstance(data, dict):
        raise TypeError("Config root must be a mapping")
    return data


def load_config(path: str | Path) -> AppConfig:
    cfg = _parse_yaml(Path(path))
    map_cfg = cfg.get("map") or {}
    cluster_cfg = map_cfg.get("cluster") or {}
    export_cfg = map_cfg.get("export") or {}

    return AppConfig(
        title=str(cfg.get("title") or AppConfig.title),
        map=MapConfig(
            width=int(map_cfg.get("width") or MapConfig.width),
            height=int(map_cfg.get("height") or MapConfig.height),
            background_color=str(map_cfg.get("background_color") or MapConfig.background_color),
            edge_color=str(map_cfg.get("edge_color") or MapConfig.edge_color),
            text_color=str(map_cfg.get("text_color") or MapConfig.text_color),
            default_principle_color=str(
                map_cfg.get("default_principle_color") or MapConfig.default_principle_color
            ),
            principle_colors={str(k): str(v) for k, v in (map_cfg.get("principle_colors") or {}).items()},
            cluster=ClusterStyle(
                halo_alpha=int(cluster_cfg.get("halo_alpha") or ClusterStyle.halo_alpha),
                halo_padding=float(cluster_cfg.get("halo_padding") or ClusterStyle.halo_padding),
                label_size=int(cluster_cfg.get("label_size") or ClusterStyle.label_size),
                border_width=int(cluster_cfg.get("border_width") or ClusterStyle.border_width),
            ),
            export=ExportMode(
                png=bool(export_cfg.get("png", True)),
                svg=bool(export_cfg.get("svg", False)),
                html=bool(export_cfg.get("html", False)),
            ),
        ),
    )
