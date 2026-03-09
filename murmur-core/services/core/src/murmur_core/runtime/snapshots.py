from __future__ import annotations

import hashlib
import hmac
import json
import os
from pathlib import Path


class SnapshotEngine:
    def __init__(self, root: str):
        self.root = Path(root)
        self.root.mkdir(parents=True, exist_ok=True)
        self.secret = os.getenv("MURMUR_SIGNING_SECRET", "dev-secret").encode("utf-8")

    def _sign(self, blob: bytes) -> str:
        return hmac.new(self.secret, blob, hashlib.sha256).hexdigest()

    def save(self, run_id: str, payload: dict) -> dict:
        blob = json.dumps(payload, sort_keys=True).encode("utf-8")
        manifest = {
            "run_id": run_id,
            "signature": self._sign(blob),
            "sha256": hashlib.sha256(blob).hexdigest(),
        }
        (self.root / f"{run_id}.json").write_bytes(blob)
        (self.root / f"{run_id}.manifest.json").write_text(json.dumps(manifest), encoding="utf-8")
        return manifest

    def recall(self, run_id: str) -> dict:
        blob = (self.root / f"{run_id}.json").read_bytes()
        manifest = json.loads((self.root / f"{run_id}.manifest.json").read_text(encoding="utf-8"))
        if manifest["signature"] != self._sign(blob):
            raise ValueError("snapshot-signature-invalid")
        return json.loads(blob.decode("utf-8"))
