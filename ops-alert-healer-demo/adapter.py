import hashlib
import hmac
import json
import os
from typing import Any

try:
    from flask import Flask, Response, jsonify, request
except ModuleNotFoundError:  # enables unit tests without runtime deps installed
    Flask = None
    Response = Any
    jsonify = None
    request = None

try:
    import redis
except ModuleNotFoundError:
    redis = None


STREAM_NAME = os.getenv("ALERT_STREAM", "alerts")
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
SIGNING_SECRET = os.getenv("ALERTMANAGER_SIGNING_SECRET", "")
SIGNATURE_HEADER = os.getenv("SIGNATURE_HEADER", "X-Alertmanager-Signature")



def _signature_for_payload(payload: bytes, secret: str) -> str:
    digest = hmac.new(secret.encode("utf-8"), payload, hashlib.sha256).hexdigest()
    return f"sha256={digest}"


def _validate_signature(payload: bytes, received_signature: str | None, secret: str) -> bool:
    if not secret:
        return True
    if not received_signature:
        return False
    expected = _signature_for_payload(payload, secret)
    return hmac.compare_digest(expected, received_signature)


def _alert_summary(alert: dict[str, Any]) -> dict[str, str]:
    labels = alert.get("labels", {})
    annotations = alert.get("annotations", {})
    return {
        "alertname": labels.get("alertname", ""),
        "severity": labels.get("severity", ""),
        "target_service": labels.get("target_service", ""),
        "action": labels.get("action", "restart"),
        "summary": annotations.get("summary", ""),
    }


if Flask is not None and redis is not None:
    app = Flask(__name__)
    redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True)

    @app.post("/webhook/alertmanager")
    def alertmanager_webhook() -> Response:
        payload = request.get_data(cache=False)
        signature = request.headers.get(SIGNATURE_HEADER)
        if not _validate_signature(payload, signature, SIGNING_SECRET):
            return jsonify({"error": "invalid signature"}), 401

        body = request.get_json(silent=True)
        if not isinstance(body, dict):
            return jsonify({"error": "invalid json payload"}), 400

        alerts = body.get("alerts", [])
        if not isinstance(alerts, list):
            return jsonify({"error": "alerts must be a list"}), 400

        published = 0
        for alert in alerts:
            if not isinstance(alert, dict):
                continue
            summary = _alert_summary(alert)
            event = {
                "status": body.get("status", ""),
                "receiver": body.get("receiver", ""),
                "startsAt": alert.get("startsAt", ""),
                "endsAt": alert.get("endsAt", ""),
                "payload": json.dumps(alert),
                "summary": json.dumps(summary),
            }
            redis_client.xadd(STREAM_NAME, event, maxlen=2000, approximate=True)
            published += 1

        return jsonify({"published": published, "stream": STREAM_NAME}), 202

    @app.get("/health")
    def health() -> Response:
        return jsonify({"status": "ok"})
else:
    app = None


if __name__ == "__main__":
    if app is None:
        raise RuntimeError("Missing runtime deps: install flask and redis")
    app.run(host="0.0.0.0", port=8080)
