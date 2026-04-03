from __future__ import annotations

import json
from datetime import datetime, timezone
from pathlib import Path


class MurmurLogger:
    def __init__(self, log_file: Path) -> None:
        self.log_file = log_file

    def log(self, prompt: str, response: str) -> None:
        entry = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "prompt": prompt,
            "response": response,
        }
        history: list[dict[str, str]] = []

        if self.log_file.exists():
            try:
                existing = json.loads(self.log_file.read_text(encoding="utf-8"))
                if isinstance(existing, list):
                    history = existing
            except json.JSONDecodeError:
                history = []

        history.append(entry)
        self.log_file.write_text(json.dumps(history, indent=2), encoding="utf-8")
