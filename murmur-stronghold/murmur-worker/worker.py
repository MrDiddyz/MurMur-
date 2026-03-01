import json
import os
import time
from datetime import datetime, timezone

import jwt
import psycopg2
import redis
import requests

r = redis.Redis(host=os.getenv("REDIS_HOST"), decode_responses=True)
max_job_retries = int(os.getenv("MAX_JOB_RETRIES", "5"))


def log(level, message, **fields):
    payload = {
        "ts": datetime.now(timezone.utc).isoformat(),
        "level": level,
        "service": "murmur-worker",
        "msg": message,
        **fields,
    }
    print(json.dumps(payload), flush=True)


def get_db_connection():
    return psycopg2.connect(os.getenv("DATABASE_URL"))


def get_token():
    return jwt.encode({"service": "worker"}, os.getenv("JWT_SECRET"), algorithm="HS256")


def enqueue_retry(intent_id, retries):
    payload = json.dumps({"intent_id": intent_id, "retries": retries})
    r.lpush("agent_queue", payload)


def move_to_dead_letter(intent_id, retries):
    payload = json.dumps({"intent_id": intent_id, "retries": retries})
    r.lpush("agent_queue_dead", payload)


def parse_job_payload(payload):
    if payload.startswith("{"):
        parsed = json.loads(payload)
        return str(parsed["intent_id"]), int(parsed.get("retries", 0))
    return str(payload), 0


def update_job_state(intent_id, job_status, intent_status=None, increment_retry=False):
    with get_db_connection() as db:
        with db.cursor() as cur:
            if increment_retry:
                cur.execute(
                    "UPDATE jobs SET retries = retries + 1, status=%s WHERE intent_id=%s",
                    (job_status, intent_id),
                )
            else:
                cur.execute("UPDATE jobs SET status=%s WHERE intent_id=%s", (job_status, intent_id))

            if intent_status is not None:
                cur.execute("UPDATE payment_intents SET status=%s WHERE id=%s", (intent_status, intent_id))
        db.commit()


while True:
    job = r.brpop("agent_queue", timeout=5)
    if not job:
        continue

    payload = job[1]
    try:
        intent_id, retries = parse_job_payload(payload)
    except Exception as error:
        log("error", "invalid job payload; dropping", payload=payload, error=str(error))
        continue

    try:
        with get_db_connection() as db:
            with db.cursor() as cur:
                cur.execute("SELECT goal FROM payment_intents WHERE id=%s", (intent_id,))
                row = cur.fetchone()
                if not row:
                    log("warn", "intent not found, dropping job", intent_id=intent_id)
                    continue
                goal = row[0]

        res = requests.post(
            os.getenv("CORE_URL") + "/run",
            json={"goal": goal},
            headers={"Authorization": "Bearer " + get_token()},
            timeout=20,
        )
        res.raise_for_status()

        update_job_state(intent_id=intent_id, job_status="completed", intent_status="completed")
        log("info", "job completed", intent_id=intent_id, retries=retries)
    except Exception as error:
        next_retries = retries + 1
        if next_retries >= max_job_retries:
            try:
                move_to_dead_letter(intent_id, next_retries)
                update_job_state(
                    intent_id=intent_id,
                    job_status="failed",
                    intent_status="failed",
                    increment_retry=True,
                )
                log("error", "job moved to dead letter queue", intent_id=intent_id, retries=next_retries)
            except Exception as db_error:
                log(
                    "error",
                    "failed to finalize dead-letter transition",
                    intent_id=intent_id,
                    retries=next_retries,
                    error=str(db_error),
                )
            continue

        backoff = min(2**retries, 30)
        time.sleep(backoff)
        try:
            update_job_state(intent_id=intent_id, job_status="retrying", increment_retry=True)
            enqueue_retry(intent_id, next_retries)
            log("warn", "job retrying", intent_id=intent_id, retries=next_retries, error=str(error))
        except Exception as retry_error:
            log(
                "error",
                "failed to requeue retry",
                intent_id=intent_id,
                retries=next_retries,
                error=str(retry_error),
            )
