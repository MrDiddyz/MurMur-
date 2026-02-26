from __future__ import annotations

import json
import os
import sqlite3
from typing import Optional

from murmur_core.runtime.models import Event, Run, Task


class Store:
    def __init__(self, db_path: str):
        self.db_path = db_path
        if os.path.dirname(db_path):
            os.makedirs(os.path.dirname(db_path), exist_ok=True)
        self._init()

    @staticmethod
    def from_env() -> "Store":
        return Store(db_path=os.getenv("MURMUR_DB_PATH", "murmur.db"))

    def _conn(self):
        return sqlite3.connect(self.db_path)

    def _init(self):
        with self._conn() as c:
            c.execute(
                """
            CREATE TABLE IF NOT EXISTS runs(
              run_id TEXT PRIMARY KEY,
              goal TEXT NOT NULL,
              status TEXT NOT NULL,
              summary TEXT NOT NULL,
              blob TEXT NOT NULL
            )"""
            )
            c.execute(
                """
            CREATE TABLE IF NOT EXISTS events(
              event_id TEXT PRIMARY KEY,
              run_id TEXT NOT NULL,
              ts TEXT NOT NULL,
              role TEXT NOT NULL,
              type TEXT NOT NULL,
              message TEXT NOT NULL,
              data TEXT NOT NULL
            )"""
            )
            c.execute(
                """
            CREATE TABLE IF NOT EXISTS tasks(
              task_id TEXT PRIMARY KEY,
              run_id TEXT NOT NULL,
              role TEXT NOT NULL,
              title TEXT NOT NULL,
              status TEXT NOT NULL,
              input TEXT NOT NULL,
              output TEXT NOT NULL,
              error TEXT
            )"""
            )

    def upsert_run(self, run: Run) -> None:
        blob = run.model_dump_json()
        with self._conn() as c:
            c.execute(
                """
            INSERT INTO runs(run_id, goal, status, summary, blob)
            VALUES(?,?,?,?,?)
            ON CONFLICT(run_id) DO UPDATE SET
              goal=excluded.goal,
              status=excluded.status,
              summary=excluded.summary,
              blob=excluded.blob
            """,
                (run.run_id, run.goal, run.status, run.summary, blob),
            )

    def add_event(self, event: Event) -> None:
        with self._conn() as c:
            c.execute(
                """
            INSERT INTO events(event_id, run_id, ts, role, type, message, data)
            VALUES(?,?,?,?,?,?,?)
            """,
                (event.event_id, event.run_id, event.ts, event.role, event.type, event.message, json.dumps(event.data)),
            )

    def add_task(self, task: Task) -> None:
        with self._conn() as c:
            c.execute(
                """
            INSERT INTO tasks(task_id, run_id, role, title, status, input, output, error)
            VALUES(?,?,?,?,?,?,?,?)
            """,
                (
                    task.task_id,
                    task.run_id,
                    task.role,
                    task.title,
                    task.status,
                    json.dumps(task.input),
                    json.dumps(task.output),
                    task.error,
                ),
            )

    def update_task(self, task: Task) -> None:
        with self._conn() as c:
            c.execute(
                """
            UPDATE tasks SET status=?, input=?, output=?, error=? WHERE task_id=?
            """,
                (task.status, json.dumps(task.input), json.dumps(task.output), task.error, task.task_id),
            )

    def get_run(self, run_id: str) -> Optional[Run]:
        with self._conn() as c:
            row = c.execute("SELECT blob FROM runs WHERE run_id=?", (run_id,)).fetchone()
            if not row:
                return None
            run = Run.model_validate_json(row[0])

            ev_rows = c.execute(
                """
              SELECT event_id, run_id, ts, role, type, message, data
              FROM events WHERE run_id=? ORDER BY ts ASC
            """,
                (run_id,),
            ).fetchall()
            run.events = []
            for event_id, rid, ts, role, typ, msg, data in ev_rows:
                run.events.append(
                    Event(
                        event_id=event_id,
                        run_id=rid,
                        ts=ts,
                        role=role,
                        type=typ,
                        message=msg,
                        data=json.loads(data or "{}"),
                    )
                )

            task_rows = c.execute(
                """
              SELECT task_id, run_id, role, title, status, input, output, error
              FROM tasks WHERE run_id=?
            """,
                (run_id,),
            ).fetchall()
            run.tasks = []
            for task_id, rid, role, title, status, inp, out, err in task_rows:
                run.tasks.append(
                    Task(
                        task_id=task_id,
                        run_id=rid,
                        role=role,
                        title=title,
                        status=status,
                        input=json.loads(inp or "{}"),
                        output=json.loads(out or "{}"),
                        error=err,
                    )
                )
            return run
