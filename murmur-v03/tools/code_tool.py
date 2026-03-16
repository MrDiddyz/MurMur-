import subprocess
import time


def run_python(code: str):
    start = time.time()
    try:
        p = subprocess.run(
            ["python", "-c", code],
            capture_output=True,
            text=True,
            timeout=3,
            env={"PYTHONUNBUFFERED": "1"},
        )
        return {
            "ok": p.returncode == 0,
            "stdout": p.stdout[:1000],
            "stderr": p.stderr[:1000],
            "duration_ms": int((time.time() - start) * 1000),
        }
    except subprocess.TimeoutExpired:
        return {"ok": False, "stdout": "", "stderr": "timeout", "duration_ms": 3000}
