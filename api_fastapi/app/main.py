from fastapi import FastAPI

from app.api import router

app = FastAPI(title="api_fastapi")
app.include_router(router)
