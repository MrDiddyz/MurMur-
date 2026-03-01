import json
import os
import time
from dataclasses import dataclass
from typing import Any

try:
    import docker
except ModuleNotFoundError:
    docker = None

try:
    import redis
except ModuleNotFoundError:
    redis = None


STREAM_NAME = os.getenv("ALERT_STREAM", "alerts")
GROUP_NAME = os.getenv("ALERT_GROUP", "healers")
CONSUMER_NAME = os.getenv("HEALER_CONSUMER", "healer-1")
REDIS_URL = os.getenv("REDIS_URL", "redis://redis:6379/0")
ALLOWLIST = {s.strip() for s in os.getenv("ALLOWLIST_TARGETS", "dummy-service").split(",") if s.strip()}
MIN_RESTART_INTERVAL_SECONDS = int(os.getenv("MIN_RESTART_INTERVAL_SECONDS", "60"))
READ_BLOCK_MS = int(os.getenv("READ_BLOCK_MS", "3000"))


@dataclass
class ActionDecision:
    should_restart: bool
    target: str
    reason: str


def parse_decision(entry_fields: dict[str, str], now: float, last_restart_at: dict[str, float]) -> ActionDecision:
    summary = json.loads(entry_fields.get("summary", "{}"))
    target = summary.get("target_service", "")
    action = summary.get("action", "restart")

    if action != "restart":
        return ActionDecision(False, target, f"unsupported action={action}")

    if not target:
        return ActionDecision(False, target, "missing target_service label")

    if target not in ALLOWLIST:
        return ActionDecision(False, target, "target not allowlisted")

    last = last_restart_at.get(target, 0)
    if now - last < MIN_RESTART_INTERVAL_SECONDS:
        return ActionDecision(False, target, "rate limited")

    return ActionDecision(True, target, "eligible")


def ensure_group(client: Any) -> None:
    try:
        client.xgroup_create(STREAM_NAME, GROUP_NAME, id="0", mkstream=True)
        print(f"created stream group {GROUP_NAME}")
    except Exception as exc:
        if "BUSYGROUP" not in str(exc):
            raise


def restart_target(container_client: Any, target: str) -> None:
    container = container_client.containers.get(target)
    container.restart(timeout=5)


def run() -> None:
    if redis is None or docker is None:
        raise RuntimeError("Missing runtime deps: install redis and docker")

    redis_client = redis.Redis.from_url(REDIS_URL, decode_responses=True)
    docker_client = docker.from_env()
    ensure_group(redis_client)

    last_restart_at: dict[str, float] = {}
    print("healer running")

    while True:
        messages = redis_client.xreadgroup(
            groupname=GROUP_NAME,
            consumername=CONSUMER_NAME,
            streams={STREAM_NAME: ">"},
            count=10,
            block=READ_BLOCK_MS,
        )

        for _, entries in messages:
            for entry_id, fields in entries:
                decision = parse_decision(fields, time.time(), last_restart_at)
                if decision.should_restart:
                    try:
                        restart_target(docker_client, decision.target)
                        last_restart_at[decision.target] = time.time()
                        print(f"restarted target={decision.target} entry_id={entry_id}")
                    except Exception as exc:
                        print(f"restart failed target={decision.target} entry_id={entry_id} err={exc}")
                else:
                    print(f"ignored entry_id={entry_id} target={decision.target} reason={decision.reason}")

                redis_client.xack(STREAM_NAME, GROUP_NAME, entry_id)


if __name__ == "__main__":
    run()
