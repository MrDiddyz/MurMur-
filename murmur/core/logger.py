from __future__ import annotations

import json
import os
import tempfile
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
        payload = json.dumps(history, indent=2)

        # Write atomically: write to a temp file in the same directory, then
        # rename into place so a concurrent reader never sees a partial file.
        dir_path = self.log_file.parent
        dir_path.mkdir(parents=True, exist_ok=True)
        fd, tmp_path = tempfile.mkstemp(dir=dir_path, suffix=".tmp")
        try:
            try:
                fh = os.fdopen(fd, "w", encoding="utf-8")
            except Exception:
                os.close(fd)
                raise
            with fh:
                fh.write(payload)
            os.replace(tmp_path, self.log_file)
        except Exception:
            try:
                os.unlink(tmp_path)
            except OSError:
                pass
            raise
