import os

from redis import Redis
from rq import Connection, Worker

redis_url = os.getenv("REDIS_URL", "redis://redis:6379/0")


if __name__ == "__main__":
    redis_conn = Redis.from_url(redis_url)
    with Connection(redis_conn):
        worker = Worker(["murmur-jobs"])
        worker.work()
