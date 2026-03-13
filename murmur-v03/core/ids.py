from datetime import datetime, timezone
from hashlib import sha1
from uuid import uuid4


def utc_now():
    return datetime.now(timezone.utc)


def iso_now() -> str:
    return utc_now().isoformat()


def gen_id(prefix: str) -> str:
    ts = datetime.now(timezone.utc).strftime("%Y%m%d%H%M%S")
    return f"{prefix}_{ts}_{uuid4().hex[:6]}"


def event_id(seed: str) -> str:
    return f"evt_{sha1(seed.encode()).hexdigest()[:10]}"
