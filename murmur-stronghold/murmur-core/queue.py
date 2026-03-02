import json
import os

from redis import Redis


def get_redis_client() -> Redis:
    return Redis.from_url(os.getenv("REDIS_URL", "redis://redis:6379/0"), decode_responses=True)


def get_queue_name() -> str:
    return os.getenv("QUEUE_NAME", "tasks")


def enqueue_task(task: dict):
    client = get_redis_client()
    client.lpush(get_queue_name(), json.dumps(task))


def pop_task(block_timeout_seconds: int = 0):
    client = get_redis_client()
    item = client.brpop(get_queue_name(), timeout=block_timeout_seconds)
    if not item:
        return None
    _, payload = item
    return json.loads(payload)
