from fastapi import FastAPI

from .routes import router

app = FastAPI(title="MurMur Orchestrator FastAPI")
app.include_router(router)


@app.get("/health")
def health():
    return {"ok": True}
