import os

from redis import Redis
from rq import Queue

from storage.db import SessionLocal


redis_conn = Redis.from_url(os.getenv("REDIS_URL", "redis://redis:6379/0"))
job_queue = Queue("murmur-jobs", connection=redis_conn)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
