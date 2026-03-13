from fastapi import FastAPI

from apps.api.routes import router

app = FastAPI(title="MurMur v0.3")
app.include_router(router)
