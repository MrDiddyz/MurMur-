from __future__ import annotations

import json
from pathlib import Path


def export_manifest(video_id: str, hook: str, script: str, out_dir: str = "exports") -> str:
    path = Path(out_dir)
    path.mkdir(parents=True, exist_ok=True)
    payload = {
        "video_id": video_id,
        "ratio": "9:16",
        "hook": hook,
        "script": script,
        "platforms": {
            "tiktok": {"mode": "semimanual", "notes": "Export MP4 + caption for manual upload"},
            "capcut": {"mode": "semimanual", "notes": "Import assets into template manually"},
            "instagram_reels": {"mode": "api_request_ready"},
            "youtube_shorts": {"mode": "upload_stub"},
        },
    }
    outfile = path / f"{video_id}.json"
    outfile.write_text(json.dumps(payload, indent=2), encoding="utf-8")
    return str(outfile)


if __name__ == "__main__":
    print(export_manifest("demo-id", "Your comfort is expensive.", "Hook -> escalation -> payoff -> loop"))
