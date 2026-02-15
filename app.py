from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from orchestrator import run_murmur

app = FastAPI(title="MurMur")

app.mount("/static", StaticFiles(directory="static"), name="static")

class MurMurRequest(BaseModel):
    text: str
    tone: str = "neutral"

@app.get("/", response_class=HTMLResponse)
def home():
    with open("static/index.html", "r", encoding="utf-8") as f:
        return f.read()

@app.post("/reflect")
def reflect(req: MurMurRequest):
    response = run_murmur(req.text, req.tone)
    return {"response": response}
