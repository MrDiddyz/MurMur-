from __future__ import annotations

import os
from typing import Any, Dict
import requests


def instagram_reels_container(video_url: str, caption: str) -> Dict[str, Any]:
    token = os.getenv("INSTAGRAM_ACCESS_TOKEN", "")
    ig_user_id = os.getenv("INSTAGRAM_IG_USER_ID", "")
    if not token or not ig_user_id:
        raise RuntimeError("Missing INSTAGRAM_ACCESS_TOKEN or INSTAGRAM_IG_USER_ID")

    endpoint = f"https://graph.facebook.com/v22.0/{ig_user_id}/media"
    payload = {
        "media_type": "REELS",
        "video_url": video_url,
        "caption": caption,
        "access_token": token,
    }
    response = requests.post(endpoint, data=payload, timeout=20)
    response.raise_for_status()
    return response.json()


def youtube_shorts_upload_stub(video_path: str, title: str, description: str) -> Dict[str, str]:
    return {
        "status": "stub",
        "message": "Implement OAuth + resumable upload against YouTube Data API v3.",
        "video_path": video_path,
        "title": title,
        "description": description,
    }


def tiktok_capcut_notice() -> str:
    return "TikTok and CapCut are semimanual/export-first in v0.4 (no auto posting)."


if __name__ == "__main__":
    print(tiktok_capcut_notice())
