#!/usr/bin/env python3
"""
Breach monitor — 100% free, zero API keys required.

Two independent checks run on every scan:

  1. EMAIL BREACHES  — XposedOrNot API (https://xposedornot.com)
     Checks whether email addresses appear in known data breaches.
     Free, no account or key needed.

  2. PWNED PASSWORDS — HIBP k-anonymity API (https://haveibeenpwned.com/Passwords)
     Checks whether passwords appear in breach dumps.
     Only the first 5 chars of the SHA-1 hash are sent — password never leaves machine.
     Free, no account or key needed.

Environment variables:
  BREACH_WATCH_EMAILS              Comma-separated emails to check (optional)
  PWNED_PASSWORDS                  Comma-separated passwords to check (optional)
  BREACH_WATCH_ONCE                1 = run once and exit, 0/omit = loop
  BREACH_WATCH_INTERVAL_SECONDS    Seconds between scans (default: 3600)
  BREACH_WATCH_STATE_FILE          Path to state JSON (default: .cache/breach_watch_state.json)
  BREACH_WATCH_WEBHOOK_URL         Optional webhook URL to POST alerts to
"""
from __future__ import annotations

import hashlib
import json
import os
import sys
import time
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

XON_API = "https://api.xposedornot.com/v1/check-email/"
PWNED_PASSWORDS_API = "https://api.pwnedpasswords.com/range/"
DEFAULT_INTERVAL_SECONDS = 3600
DEFAULT_STATE_PATH = ".cache/breach_watch_state.json"
USER_AGENT = "MurMur-BreachWatch/2.0"


def _utc_now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _sha1(password: str) -> str:
    return hashlib.sha1(password.encode("utf-8")).hexdigest().upper()


def _pwned_count(password: str) -> int:
    """Check password breach count using k-anonymity. Password never leaves machine."""
    digest = _sha1(password)
    prefix, suffix = digest[:5], digest[5:]
    req = urllib.request.Request(
        url=f"{PWNED_PASSWORDS_API}{prefix}",
        method="GET",
        headers={"user-agent": USER_AGENT, "Add-Padding": "true"},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = resp.read().decode("utf-8")
    except urllib.error.HTTPError as e:
        raise RuntimeError(f"HIBP Pwned Passwords HTTP error: {e.code}") from e
    except urllib.error.URLError as e:
        raise RuntimeError(f"Network error contacting HIBP: {e.reason}") from e
    for line in body.splitlines():
        parts = line.strip().split(":")
        if len(parts) == 2 and parts[0].upper() == suffix:
            return int(parts[1])
    return 0


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
    return [x.strip() for x in raw.split(",") if x.strip()]


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


def _label(password: str) -> str:
    """Show only first 2 chars + *** to avoid logging real passwords."""
    if len(password) <= 2:
        return "*" * len(password)
    return password[:2] + "***"


def _check_email_breaches(email: str) -> list[str]:
    """Check email against XposedOrNot — free, no API key needed."""
    import urllib.parse
    url = XON_API + urllib.parse.quote(email, safe="")
    req = urllib.request.Request(
        url=url,
        method="GET",
        headers={"user-agent": USER_AGENT},
    )
    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            body = resp.read().decode("utf-8")
            data = json.loads(body)
            # XON returns {"breaches": [["SiteName", ...], ...]} or {"Error": "Not found"}
            if "Error" in data:
                return []
            breaches = data.get("breaches", [])
            # Flatten: each entry can be a list of names
            names: list[str] = []
            for b in breaches:
                if isinstance(b, list):
                    names.extend(str(x) for x in b if x)
                elif isinstance(b, str):
                    names.append(b)
            return names
    except urllib.error.HTTPError as e:
        if e.code == 404:
            return []  # Email not found in any breach
        raise RuntimeError(f"XposedOrNot HTTP error: {e.code}") from e
    except urllib.error.URLError as e:
        raise RuntimeError(f"Network error contacting XposedOrNot: {e.reason}") from e


def _scan_once(
    emails: list[str],
    passwords: list[str],
    state_path: Path,
    webhook_url: str | None,
) -> None:
    state = _load_state(state_path)
    seen: dict[str, Any] = state.get("seen", {})
    if not isinstance(seen, dict):
        seen = {}

    # --- Email breach checks (XposedOrNot, free) ---
    for email in emails:
        try:
            found = _check_email_breaches(email)
        except RuntimeError as e:
            print(f"[error] {email}: {e}", file=sys.stderr)
            continue

        known = set(seen.get(f"email:{email}", []))
        new_breaches = [b for b in found if b not in known]

        if new_breaches:
            print(f"[ALERT] {email}: found in {len(new_breaches)} new breach(es)!")
            for b in new_breaches:
                print(f"  - {b}")
            if webhook_url:
                _post_webhook(webhook_url, {
                    "source": "murmur-breach-watch",
                    "type": "email_breach",
                    "time": _utc_now(),
                    "email": email,
                    "new_breaches": new_breaches,
                })
        elif found:
            print(f"[ok] {email}: {len(found)} known breach(es), no new ones")
        else:
            print(f"[ok] {email}: not found in any breach")

        seen[f"email:{email}"] = sorted(set(found))
        time.sleep(1.0)

    # --- Password checks (HIBP k-anonymity, free) ---
    for password in passwords:
        digest = _sha1(password)
        label = _label(password)
        try:
            count = _pwned_count(password)
        except RuntimeError as e:
            print(f"[error] {label}: {e}", file=sys.stderr)
            continue

        prev_count = seen.get(f"pwd:{digest}", 0)
        if count > 0 and count != prev_count:
            status = "NEW" if prev_count == 0 else "UPDATED"
            print(f"[ALERT] Password '{label}' found {count:,} times in breach data! [{status}]")
            if webhook_url:
                _post_webhook(webhook_url, {
                    "source": "murmur-breach-watch",
                    "type": "pwned_password",
                    "time": _utc_now(),
                    "label": label,
                    "count": count,
                    "status": status,
                })
        elif count == 0:
            print(f"[ok] Password '{label}': not found in any known breach")
        else:
            print(f"[ok] Password '{label}': {count:,} breach hits (unchanged)")

        seen[f"pwd:{digest}"] = count
        time.sleep(1.5)

    state["seen"] = seen
    state["last_run"] = _utc_now()
    _save_state(state_path, state)


def main() -> int:
    emails = _env_list("BREACH_WATCH_EMAILS")
    passwords = _env_list("PWNED_PASSWORDS")
    webhook_url = (os.getenv("BREACH_WATCH_WEBHOOK_URL") or "").strip() or None
    state_path = Path((os.getenv("BREACH_WATCH_STATE_FILE") or DEFAULT_STATE_PATH).strip())
    once = (os.getenv("BREACH_WATCH_ONCE") or "0").strip() in {"1", "true", "yes"}

    interval_raw = (os.getenv("BREACH_WATCH_INTERVAL_SECONDS") or str(DEFAULT_INTERVAL_SECONDS)).strip()
    try:
        interval = max(60, int(interval_raw))
    except ValueError:
        print("[error] BREACH_WATCH_INTERVAL_SECONDS must be an integer", file=sys.stderr)
        return 2

    if not emails and not passwords:
        print("[error] Set BREACH_WATCH_EMAILS and/or PWNED_PASSWORDS in .env", file=sys.stderr)
        return 2

    parts = []
    if emails:
        parts.append(f"{len(emails)} email(s) via XposedOrNot")
    if passwords:
        parts.append(f"{len(passwords)} password(s) via HIBP")
    print(f"[start] checking {', '.join(parts)} — no API key needed")

    if once:
        _scan_once(emails, passwords, state_path, webhook_url)
        return 0

    while True:
        started = time.monotonic()
        _scan_once(emails, passwords, state_path, webhook_url)
        elapsed = time.monotonic() - started
        sleep_for = max(1.0, interval - elapsed)
        print(f"[sleep] next scan in {int(sleep_for)}s")
        time.sleep(sleep_for)


if __name__ == "__main__":
    raise SystemExit(main())
