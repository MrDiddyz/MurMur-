from core.orchestrator import Orchestrator
from events.types import RUN_FAILED
from storage.db import session_scope


def process_job(job_id: str, run_id: str, req: dict):
    with session_scope() as session:
        orch = Orchestrator(session)
        try:
            orch.run_job(job_id, run_id, req)
        except Exception as exc:
            orch.emit(job_id, run_id, RUN_FAILED, "worker", {"error": str(exc)})
            raise
