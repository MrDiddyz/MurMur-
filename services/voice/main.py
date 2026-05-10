from __future__ import annotations

import os
from pathlib import Path
from dotenv import load_dotenv

from services.common.openai_client import get_openai

load_dotenv()


def synthesize(text: str, output_path: str) -> str:
    client = get_openai()
    audio = client.audio.speech.create(
        model=os.getenv("OPENAI_MODEL_TTS", "gpt-4o-mini-tts"),
        voice="alloy",
        input=text,
    )
    out = Path(output_path)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_bytes(audio.read())
    return str(out)


if __name__ == "__main__":
    target = synthesize("Discipline compounds. Your excuses do too.", "artifacts/voice/demo.mp3")
    print(f"Wrote {target}")
