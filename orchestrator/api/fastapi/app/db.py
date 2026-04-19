import os
from contextlib import contextmanager
from psycopg import Connection
from psycopg.rows import dict_row

_DATABASE_URL = os.getenv("DATABASE_URL")
if not _DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL environment variable is not set. "
        "Refusing to start with a hardcoded default credential."
    )
DATABASE_URL: str = _DATABASE_URL


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
