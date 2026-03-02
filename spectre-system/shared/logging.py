import json
from datetime import datetime, timezone


def log_json(service: str, level: str, msg: str, **fields: object) -> None:
    payload = {
        "service": service,
        "level": level,
        "msg": msg,
        "time": datetime.now(timezone.utc).isoformat(timespec="milliseconds"),
    }
    payload.update(fields)
    print(json.dumps(payload, separators=(",", ":"), sort_keys=True))
