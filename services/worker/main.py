from __future__ import annotations

import json
import os
import subprocess
from pathlib import Path
from dotenv import load_dotenv

from services.common.openai_client import get_openai
from services.common.supabase_client import get_supabase

load_dotenv()


def generate_script(topic: str, variation_label: str) -> dict:
    client = get_openai()
    prompt = (
        "Create a short-form script with MurMur style: black/gold cinematic, minimal text, "
        "hook -> escalation -> payoff -> loop, disciplined growth tension energy. "
        f"Topic: {topic}. Variation: {variation_label}."
    )
    response = client.responses.create(model=os.getenv("OPENAI_MODEL_SCRIPT", "gpt-4.1-mini"), input=prompt)
    text = response.output_text.strip()
    lines = [line.strip(" -") for line in text.splitlines() if line.strip()]
    hook = lines[0] if lines else f"Discipline starts with one hard choice ({variation_label})"
    return {"topic": topic, "variation_label": variation_label, "hook": hook, "script": text}


def generate_image_prompt(script: str) -> str:
    return f"9:16 cinematic still, black and gold palette, premium mood. Scene inspired by: {script[:400]}"


def generate_tts(script: str) -> bytes:
    client = get_openai()
    audio = client.audio.speech.create(
        model=os.getenv("OPENAI_MODEL_TTS", "gpt-4o-mini-tts"), voice="alloy", input=script
    )
    return audio.read()


def render_mp4(audio_path: Path, output_path: Path) -> None:
    """Minimal render: black background + subtle gold text card + voiceover."""
    cmd = [
        "ffmpeg",
        "-y",
        "-f",
        "lavfi",
        "-i",
        "color=c=black:s=1080x1920:d=20",
        "-i",
        str(audio_path),
        "-shortest",
        "-vf",
        "drawtext=text='MurMur':fontcolor=gold:fontsize=72:x=(w-text_w)/2:y=(h-text_h)/2",
        "-c:v",
        "libx264",
        "-c:a",
        "aac",
        str(output_path),
    ]
    subprocess.run(cmd, check=True)


def build_manifest(payload: dict, output_dir: Path, mp4_path: Path) -> Path:
    manifest = {
        "brand": "MurMur",
        "format": "9:16",
        "render": {"duration_hint_sec": 26, "fps": 30, "mp4": str(mp4_path)},
        "content": payload,
        "platform_export": {
            "tiktok": "semimanual_export",
            "capcut": "semimanual_project_import",
            "instagram_reels": "api_ready",
            "youtube_shorts": "upload_stub",
        },
    }
    output_dir.mkdir(parents=True, exist_ok=True)
    path = output_dir / "manifest.json"
    path.write_text(json.dumps(manifest, indent=2), encoding="utf-8")
    return path


def run(topic: str = "discipline", variation_count: int = 3) -> None:
    supabase = get_supabase()
    for idx in range(variation_count):
        label = chr(ord("A") + idx)
        payload = generate_script(topic, label)
        payload["image_prompt"] = generate_image_prompt(payload["script"])

        assets_path = Path("artifacts") / f"{topic}-{label.lower()}"
        assets_path.mkdir(parents=True, exist_ok=True)

        audio_path = assets_path / "voice.mp3"
        audio_path.write_bytes(generate_tts(payload["script"]))

        mp4_path = assets_path / "video.mp4"
        try:
            render_mp4(audio_path, mp4_path)
            status = "rendered"
        except (subprocess.CalledProcessError, FileNotFoundError):
            status = "draft"

        manifest_path = build_manifest(payload, assets_path, mp4_path)

        insert = {
            **payload,
            "status": status,
            "manifest_url": str(manifest_path),
            "mp4_url": str(mp4_path) if mp4_path.exists() else None,
            "score": 0,
        }
        supabase.table("videos").insert(insert).execute()
        print(f"Created variation {label} for topic={topic}")


if __name__ == "__main__":
    run(topic=os.getenv("DEFAULT_TOPIC", "discipline"), variation_count=int(os.getenv("DEFAULT_VARIATION_COUNT", "3")))
