from sqlalchemy import select

from storage.models import Event, JobProjection


def events_for_latest_run(session, job_id: str):
    run_id = session.scalar(select(JobProjection.latest_run_id).where(JobProjection.job_id == job_id))
    if not run_id:
        return [], None
    rows = session.scalars(select(Event).where(Event.run_id == run_id).order_by(Event.seq.asc())).all()
    return rows, run_id
