from __future__ import annotations

from murmur_core.runtime.models import Event, Task


class BaseAgent:
    role: str

    def handle(self, task: Task) -> tuple[Task, list[Event]]:
        raise NotImplementedError


class ResearchAgent(BaseAgent):
    role = "research"

    def handle(self, task: Task):
        query = task.input.get("query", "")
        task.output = {
            "insights": [
                f"Antakelse: målgruppen reagerer best på korte, konkrete demonstrasjoner av {query or 'ideen'}.",
                "Forslag: bygg én minimal demo + én før/etter-historie.",
                "CTA: ett enkelt neste steg (book call / join / test).",
            ],
            "questions": [
                "Hvem er første betalende målgruppe (1 setning)?",
                "Hva er ett målbart resultat innen 7 dager?",
            ],
        }
        task.status = "done"
        return task, []


class BuilderAgent(BaseAgent):
    role = "builder"

    def handle(self, task: Task):
        # “local-first” stub: vi returnerer en konkret byggplan og filskisser.
        task.output = {
            "files": [
                {"path": "apps/demo/index.html", "desc": "Minimal demo UI"},
                {"path": "services/core/src/... ", "desc": "Agent service (allerede i repo)"},
            ],
            "deploy": ["docker compose up --build", "open http://localhost:8080/docs"],
        }
        task.status = "done"
        return task, []


class ContentAgent(BaseAgent):
    role = "content"

    def handle(self, task: Task):
        topic = task.input.get("topic", "MurMur Core")
        task.output = {
            "post": (
                f"MurMur Core: {topic}\n"
                "Én person → et helt team.\n"
                "Vi bygger digitale ansatte som planlegger, produserer og forbedrer seg selv.\n"
                "Kommenter ‘CORE’ hvis du vil se demoen."
            )
        }
        task.status = "done"
        return task, []


class OptimizerAgent(BaseAgent):
    role = "optimizer"

    def handle(self, task: Task):
        task.output = {
            "ab_tests": [
                {"variant": "A", "hook": "2 minutter. 0 kode. 1 fungerende app."},
                {"variant": "B", "hook": "Dette er ikke en chatbot. Det er en digital ansatt."},
            ],
            "metrics": ["CTR", "signup_rate", "reply_rate"],
        }
        task.status = "done"
        return task, []


class MemoryAgent(BaseAgent):
    role = "memory"

    def handle(self, task: Task):
        # Stub: legger “memory objects” i output. Senere: embeddings + retrieval.
        items = task.input.get("items", [])
        task.output = {"stored": items, "note": "Memory stub (bytt til vector store senere)."}
        task.status = "done"
        return task, []


class ReflectionAgent(BaseAgent):
    role = "reflection"

    def handle(self, task: Task):
        events = task.input.get("events", [])
        task.output = {
            "reflection": [
                "Hva var den største friksjonen? (f.eks. uklar målgruppe / uklar CTA)",
                "Hva var sterkest? (konkret demo + tidsramme)",
                "Neste iterasjon: én enda mer konkret demo + ett måltall.",
            ],
            "event_count": len(events),
        }
        task.status = "done"
        return task, []
