import logging
import os

from logging_config import setup_json_logging
from queue import pop_task


logger = logging.getLogger("worker")


def handle_task(task: dict):
    logger.info(
        "task.start",
        extra={"event": "task.start", "task_id": task.get("id"), "task_type": task.get("type")},
    )

    logger.info(
        "task.done",
        extra={"event": "task.done", "task_id": task.get("id"), "task_type": task.get("type")},
    )


def run():
    setup_json_logging(os.getenv("WORKER_SERVICE_NAME", "murmur-worker"))
    logger.info("worker.ready", extra={"event": "worker.ready"})

    while True:
        task = pop_task(block_timeout_seconds=0)
        if task is None:
            continue
        handle_task(task)


if __name__ == "__main__":
    run()
