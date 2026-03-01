from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel

from modules.memory import load_state
from orchestrator import run_murmur

app = FastAPI(title="MurMur")

BASE_DIR = Path(__file__).resolve().parent
STATIC_DIR = BASE_DIR / "static"
if STATIC_DIR.exists() and STATIC_DIR.is_dir():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")


class MurMurRequest(BaseModel):
    text: str
    tone: str = "knivskarp"


@app.get("/", response_class=HTMLResponse)
def home() -> str:
    index_file = STATIC_DIR / "index.html"
    if index_file.exists():
        return index_file.read_text(encoding="utf-8")

    return """
    <html>
      <body>
        <h1>MurMur API</h1>
        <p>Bruk POST /reflect for respons og GET /state for læringsstatus.</p>
      </body>
    </html>
    """


@app.post("/reflect")
def reflect(req: MurMurRequest) -> dict[str, str]:
    response = run_murmur(req.text, req.tone)
    return {"response": response}


@app.get("/state")
def state() -> dict[str, object]:
    current = load_state()
    return {
        "interactions": current.interactions,
        "niche": current.niche,
        "top_goals": current.top_goals,
        "top_obstacles": current.top_obstacles,
        "affect": current.affect,
    }
