import os


def search_web(query: str):
    if os.getenv("ENABLE_WEB_TOOL", "false").lower() != "true":
        return {"ok": False, "reason": "web.search disabled by environment"}
    return {"ok": True, "stdout": f"stubbed result for {query}", "stderr": "", "duration_ms": 1}
