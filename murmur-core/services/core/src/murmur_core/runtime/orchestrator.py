from __future__ import annotations

from typing import cast

from murmur_core.runtime.agents import (
    BuilderAgent,
    ContentAgent,
    MemoryAgent,
    OptimizerAgent,
    ReflectionAgent,
    ResearchAgent,
)
from murmur_core.runtime.contracts import validate_contract
from murmur_core.runtime.models import Event, EventType, Role, Run, Task
from murmur_core.runtime.policies import enforce_no_claim_without_evidence
from murmur_core.runtime.store import Store
from murmur_core.runtime.tracing import TraceSpan


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
        e = Event(
            run_id=run.run_id,
            role=cast(Role, role),
            type=cast(EventType, typ),
            message=message,
            data=data or {},
        )
        run.events.append(e)
        self.store.add_event(e)

    def run(self, goal: str) -> Run:
        run = Run(goal=goal)
        self.store.upsert_run(run)

        root_span = TraceSpan(run_id=run.run_id, name="run")
        self._emit(run, "orchestrator", "goal_received", "Goal received.", {"goal": goal})

        plan = [
            ("research", "Finn innsikt og avklaringer", {"query": goal}),
            ("builder", "Skisser minimal demo/byggplan", {"goal": goal}),
            ("content", "Lag 1 post + 1 CTA", {"topic": goal}),
            ("optimizer", "Lag A/B hooks + metrics", {"goal": goal}),
        ]
        self._emit(run, "orchestrator", "plan_created", "Plan created.", {"steps": [p[1] for p in plan]})

        for role, title, inp in plan:
            span = TraceSpan(
                run_id=run.run_id,
                name=f"task:{role}",
                parent_span_id=root_span.span_id,
                meta={"title": title},
            )
            task = Task(run_id=run.run_id, role=cast(Role, role), title=title, input=inp)
            run.tasks.append(task)
            self.store.add_task(task)
            self._emit(run, "orchestrator", "task_created", f"Task queued: {title}", {"role": role})

            agent = self.agents[role]
            try:
                task, extra_events = agent.handle(task)
                if role == "research":
                    enforce_no_claim_without_evidence(task.output)
                    validate_contract("research", task.output)
                if role == "builder":
                    validate_contract("builder", task.output)
                self.store.update_task(task)
                for ev in extra_events:
                    self.store.add_event(ev)
                    run.events.append(ev)
                self._emit(
                    run,
                    role,
                    "task_done",
                    f"Task done: {title}",
                    {"output_keys": list(task.output.keys()), "latency_ms": span.finish().latency_ms},
                )
            except Exception as ex:
                task.status = "failed"
                task.error = str(ex)
                self.store.update_task(task)
                run.status = "failed"
                self._emit(run, role, "task_done", f"Task failed: {title}", {"error": str(ex)})
                self.store.add_span(span.finish().as_record())
                self.store.upsert_run(run)
                return run
            self.store.add_span(span.finish().as_record())

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
        self.store.add_span(root_span.finish().as_record())
        self.store.upsert_run(run)
        return run

    def _make_summary(self, run: Run) -> str:
        parts = []
        for t in run.tasks:
            if t.status == "done" and t.output:
                parts.append(f"{t.role}:{t.title} -> {', '.join(t.output.keys())}")
        return " | ".join(parts)[:1200]
