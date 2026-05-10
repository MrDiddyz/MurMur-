from __future__ import annotations

from datetime import datetime, timezone
from dotenv import load_dotenv

from services.common.supabase_client import get_supabase

load_dotenv()


def ingest_mock_metrics() -> None:
    supabase = get_supabase()
    videos = supabase.table("videos").select("id").limit(20).execute().data or []

    rows = []
    now = datetime.now(timezone.utc).isoformat()
    for idx, video in enumerate(videos):
        rows.append(
            {
                "video_id": video["id"],
                "platform": "instagram" if idx % 2 == 0 else "youtube",
                "views": 1000 + idx * 120,
                "likes": 120 + idx * 12,
                "shares": 40 + idx * 4,
                "saves": 60 + idx * 5,
                "watch_time_sec": 14.5 + idx,
                "measured_at": now,
            }
        )

    if rows:
        supabase.table("metrics").insert(rows).execute()
        print(f"Inserted {len(rows)} metrics rows")


if __name__ == "__main__":
    ingest_mock_metrics()
