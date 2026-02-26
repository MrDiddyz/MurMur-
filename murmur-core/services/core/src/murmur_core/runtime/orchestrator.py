from __future__ import annotations

from murmur_core.runtime.agents import (
    BuilderAgent,
    ContentAgent,
    MemoryAgent,
    OptimizerAgent,
    ReflectionAgent,
    ResearchAgent,
)
from murmur_core.runtime.models import Event, Run, Task
from murmur_core.runtime.store import Store


class Orchestrator:
    def __init__(self, store: Store):
        self.store = store
        self.agents = {
            "research": ResearchAgent(),
            "builder": BuilderAgent(),
            "content": ContentAgent(),
            "optimizer": OptimizerAgent(),
            "memory": MemoryAgent(),
            "reflection": ReflectionAgent(),
        }

    def _emit(self, run: Run, role: str, typ: str, message: str, data: dict | None = None):
        e = Event(run_id=run.run_id, role=role, type=typ, message=message, data=data or {})
        run.events.append(e)
        self.store.add_event(e)

    def run(self, goal: str) -> Run:
        run = Run(goal=goal)
        self.store.upsert_run(run)

        self._emit(run, "orchestrator", "goal_received", "Goal received.", {"goal": goal})

        plan = [
            ("research", "Finn innsikt og avklaringer", {"query": goal}),
            ("builder", "Skisser minimal demo/byggplan", {"goal": goal}),
            ("content", "Lag 1 post + 1 CTA", {"topic": goal}),
            ("optimizer", "Lag A/B hooks + metrics", {"goal": goal}),
        ]
        self._emit(run, "orchestrator", "plan_created", "Plan created.", {"steps": [p[1] for p in plan]})

        for role, title, inp in plan:
            task = Task(run_id=run.run_id, role=role, title=title, input=inp)
            run.tasks.append(task)
            self.store.add_task(task)
            self._emit(run, "orchestrator", "task_created", f"Task queued: {title}", {"role": role})

            agent = self.agents[role]
            try:
                task, extra_events = agent.handle(task)
                self.store.update_task(task)
                for ev in extra_events:
                    self.store.add_event(ev)
                    run.events.append(ev)
                self._emit(run, role, "task_done", f"Task done: {title}", {"output_keys": list(task.output.keys())})
            except Exception as ex:
                task.status = "failed"
                task.error = str(ex)
                self.store.update_task(task)
                run.status = "failed"
                self._emit(run, role, "task_done", f"Task failed: {title}", {"error": str(ex)})
                self.store.upsert_run(run)
                return run

        memory_items = []
        for t in run.tasks:
            if t.status == "done":
                memory_items.append({"task": t.title, "role": t.role, "output": t.output})
        mem_task = Task(run_id=run.run_id, role="memory", title="Store run learnings", input={"items": memory_items})
        self.store.add_task(mem_task)
        mem_task, _ = self.agents["memory"].handle(mem_task)
        self.store.update_task(mem_task)
        run.tasks.append(mem_task)

        ref_task = Task(
            run_id=run.run_id,
            role="reflection",
            title="Reflect and improve",
            input={"events": [e.model_dump() for e in run.events]},
        )
        self.store.add_task(ref_task)
        ref_task, _ = self.agents["reflection"].handle(ref_task)
        self.store.update_task(ref_task)
        run.tasks.append(ref_task)
        self._emit(run, "reflection", "reflection", "Reflection complete.", ref_task.output)

        run.status = "done"
        run.summary = self._make_summary(run)
        self._emit(run, "orchestrator", "summary", "Run complete.", {"summary": run.summary})
        self.store.upsert_run(run)
        return run

    def _make_summary(self, run: Run) -> str:
        parts = []
        for t in run.tasks:
            if t.status == "done" and t.output:
                parts.append(f"{t.role}:{t.title} -> {', '.join(t.output.keys())}")
        return " | ".join(parts)[:1200]
