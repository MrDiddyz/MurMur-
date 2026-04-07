import os
from contextlib import contextmanager
from psycopg import Connection
from psycopg.rows import dict_row

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@postgres:5432/orchestrator")


@contextmanager
def get_conn() -> Connection:
    conn = Connection.connect(DATABASE_URL, row_factory=dict_row)
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()
