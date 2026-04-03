from __future__ import annotations

from dataclasses import dataclass
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
PROMPTS_DIR = BASE_DIR / "prompts"
OUTPUTS_DIR = BASE_DIR / "outputs"


@dataclass(frozen=True)
class MurmurConfig:
    model: str = "llama3.2"
    prompt_mode: str = "system"
    max_retries: int = 1


def get_prompt_path(mode: str) -> Path:
    return PROMPTS_DIR / f"{mode}.txt"


def ensure_outputs_dir() -> None:
    OUTPUTS_DIR.mkdir(parents=True, exist_ok=True)
