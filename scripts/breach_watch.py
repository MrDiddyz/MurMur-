#!/usr/bin/env python3
from __future__ import annotations

import json
import os
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

HIBP_BASE = "https://haveibeenpwned.com/api/v3"
DEFAULT_INTERVAL_SECONDS = 3600
DEFAULT_STATE_PATH = ".cache/breach_watch_state.json"
USER_AGENT = "MurMur-BreachWatch/1.0"


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _load_state(path: Path) -> dict[str, Any]:
    if not path.exists():
        return {"seen": {}, "last_run": None}
    try:
        with path.open("r", encoding="utf-8") as f:
            data = json.load(f)
        if not isinstance(data, dict):
            return {"seen": {}, "last_run": None}
        data.setdefault("seen", {})
        data.setdefault("last_run", None)
        return data
    except (json.JSONDecodeError, OSError):
        return {"seen": {}, "last_run": None}


def _save_state(path: Path, state: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as f:
        json.dump(state, f, indent=2, sort_keys=True)


def _env_list(name: str) -> list[str]:
    raw = (os.getenv(name) or "").strip()
    if not raw:
        return []
    items = [x.strip() for x in raw.split(",")]
    return [x for x in items if x]


def _request_json(url: str, api_key: str) -> Any:
    req = urllib.request.Request(
        url=url,
        method="GET",
        headers={
            "hibp-api-key": api_key,
            "user-agent": USER_AGENT,
            "accept": "application/json",
        },
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = resp.read().decode("utf-8")
            if not body:
                return []
            return json.loads(body)
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return []
        if e.code in (401, 403):
            raise RuntimeError("HIBP auth failed: check HIBP_API_KEY") from e
        if e.code == 429:
            raise RuntimeError("HIBP rate limit hit (429)") from e
        raise RuntimeError(f"HIBP HTTP error: {e.code}") from e
    except urllib.error.URLError as e:
        raise RuntimeError(f"Network error contacting HIBP: {e.reason}") from e


def _fetch_breaches_for_account(api_key: str, account: str) -> list[dict[str, Any]]:
    encoded = urllib.parse.quote(account, safe="")
    url = f"{HIBP_BASE}/breachedaccount/{encoded}?truncateResponse=false"
    data = _request_json(url, api_key)
    if isinstance(data, list):
        return [d for d in data if isinstance(d, dict)]
    return []


def _post_webhook(url: str, payload: dict[str, Any]) -> None:
    req = urllib.request.Request(
        url=url,
        method="POST",
        headers={"content-type": "application/json", "user-agent": USER_AGENT},
        data=json.dumps(payload).encode("utf-8"),
    )
    try:
        with urllib.request.urlopen(req, timeout=20):
            return
    except Exception as e:
        print(f"[warn] webhook post failed: {e}", file=sys.stderr)


def _new_breaches(
    account: str,
    breaches: list[dict[str, Any]],
    seen: dict[str, list[str]],
) -> list[dict[str, Any]]:
    known = set(seen.get(account, []))
    fresh: list[dict[str, Any]] = []
    names: list[str] = []

    for breach in breaches:
        name = str(breach.get("Name") or "").strip()
        if not name:
            continue
        names.append(name)
        if name not in known:
            fresh.append(breach)

    seen[account] = sorted(set(names))
    return fresh


def _scan_once(api_key: str, accounts: list[str], state_path: Path, webhook_url: str | None) -> int:
    state = _load_state(state_path)
    seen = state.get("seen", {})
    if not isinstance(seen, dict):
        seen = {}

    total_new = 0
    for account in accounts:
        try:
            breaches = _fetch_breaches_for_account(api_key, account)
        except RuntimeError as e:
            print(f"[error] {account}: {e}", file=sys.stderr)
            continue

        fresh = _new_breaches(account, breaches, seen)
        if fresh:
            total_new += len(fresh)
            print(f"[alert] {account}: {len(fresh)} new breach(es)")
            for b in fresh:
                name = b.get("Name", "unknown")
                breach_date = b.get("BreachDate", "unknown")
                domain = b.get("Domain", "unknown")
                print(f"  - {name} | domain={domain} | breach_date={breach_date}")

            if webhook_url:
                _post_webhook(
                    webhook_url,
                    {
                        "source": "murmur-breach-watch",
                        "time": _utc_now(),
                        "account": account,
                        "new_breaches": fresh,
                    },
                )
        else:
            print(f"[ok] {account}: no new breaches")

    state["seen"] = seen
    state["last_run"] = _utc_now()
    _save_state(state_path, state)
    return total_new


def main() -> int:
    api_key = (os.getenv("HIBP_API_KEY") or "").strip()
    accounts = _env_list("BREACH_WATCH_EMAILS")
    webhook_url = (os.getenv("BREACH_WATCH_WEBHOOK_URL") or "").strip() or None
    state_path = Path((os.getenv("BREACH_WATCH_STATE_FILE") or DEFAULT_STATE_PATH).strip())
    once = (os.getenv("BREACH_WATCH_ONCE") or "0").strip() in {"1", "true", "yes"}

    interval_raw = (os.getenv("BREACH_WATCH_INTERVAL_SECONDS") or str(DEFAULT_INTERVAL_SECONDS)).strip()
    try:
        interval = max(60, int(interval_raw))
    except ValueError:
        print("[error] BREACH_WATCH_INTERVAL_SECONDS must be an integer", file=sys.stderr)
        return 2

    if not api_key:
        print("[error] Missing HIBP_API_KEY", file=sys.stderr)
        return 2
    if not accounts:
        print("[error] Missing BREACH_WATCH_EMAILS (comma-separated emails)", file=sys.stderr)
        return 2

    print(f"[start] monitoring {len(accounts)} account(s), interval={interval}s")
    if once:
        _scan_once(api_key, accounts, state_path, webhook_url)
        return 0

    while True:
        started = time.monotonic()
        _scan_once(api_key, accounts, state_path, webhook_url)
        elapsed = time.monotonic() - started
        sleep_for = max(1.0, interval - elapsed)
        print(f"[sleep] next run in {int(sleep_for)}s")
        time.sleep(sleep_for)


if __name__ == "__main__":
    raise SystemExit(main())
