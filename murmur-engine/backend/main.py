from fastapi import FastAPI

from backend.pipeline import run_pipeline

app = FastAPI(title="MurMur Reinforcement Engine")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/run")
def run():
    return run_pipeline()
