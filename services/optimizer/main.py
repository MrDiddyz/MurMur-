from __future__ import annotations

from collections import defaultdict
from typing import Dict
from dotenv import load_dotenv

from services.common.supabase_client import get_supabase

load_dotenv()

WEIGHTS = {
    "views": 0.25,
    "likes": 0.25,
    "shares": 0.30,
    "saves": 0.20,
}


def weighted_score(row: Dict[str, float]) -> float:
    return (
        row.get("views", 0) * WEIGHTS["views"]
        + row.get("likes", 0) * WEIGHTS["likes"]
        + row.get("shares", 0) * WEIGHTS["shares"]
        + row.get("saves", 0) * WEIGHTS["saves"]
    )


def run() -> None:
    supabase = get_supabase()
    videos = supabase.table("videos").select("id,hook,variation_label").execute().data or []
    metrics = supabase.table("metrics").select("video_id,views,likes,shares,saves").execute().data or []

    totals = defaultdict(lambda: {"views": 0, "likes": 0, "shares": 0, "saves": 0})
    for row in metrics:
        bucket = totals[row["video_id"]]
        for key in bucket.keys():
            bucket[key] += row.get(key, 0)

    scored = []
    for v in videos:
        score = weighted_score(totals[v["id"]])
        supabase.table("videos").update({"score": round(score, 2)}).eq("id", v["id"]).execute()
        scored.append({**v, "score": score})

    by_hook = defaultdict(list)
    by_variation = defaultdict(list)
    for row in scored:
        by_hook[row["hook"]].append(row)
        by_variation[row["variation_label"]].append(row)

    def top_variant(grouped):
        best = []
        for key, vals in grouped.items():
            vals = sorted(vals, key=lambda x: x["score"], reverse=True)
            best.append((key, vals[0]["id"], vals[0]["score"]))
        return sorted(best, key=lambda x: x[2], reverse=True)

    hook_leaders = top_variant(by_hook)
    variation_leaders = top_variant(by_variation)

    if len(scored) >= 2:
        top_two = sorted(scored, key=lambda x: x["score"], reverse=True)[:2]
        supabase.table("ab_tests").insert(
            {
                "video_a_id": top_two[0]["id"],
                "video_b_id": top_two[1]["id"],
                "winner_video_id": top_two[0]["id"],
                "winning_reason": "higher_weighted_score",
            }
        ).execute()

    print("Best hooks:", hook_leaders[:3])
    print("Best variations:", variation_leaders[:3])


if __name__ == "__main__":
    run()
