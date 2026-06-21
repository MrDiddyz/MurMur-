import importlib
import os
import tempfile
import time

from fastapi.testclient import TestClient

from murmur_core.runtime.security import sign_message


def test_hello_show_relay():
    with tempfile.TemporaryDirectory() as d:
        os.environ["MURMUR_DB_PATH"] = os.path.join(d, "api.db")
        import murmur_core.api as api_module

        api_module = importlib.reload(api_module)
        client = TestClient(api_module.app)
        r = client.post("/hello-show", json={"channel": "main", "cue": "intro"})
        assert r.status_code == 200
        assert r.json()["osc"] == "/main/cue intro"


def test_critical_path_endpoint_and_signed_run():
    with tempfile.TemporaryDirectory() as d:
        os.environ["MURMUR_DB_PATH"] = os.path.join(d, "api.db")
        import murmur_core.api as api_module

        api_module = importlib.reload(api_module)
        client = TestClient(api_module.app)
        now = int(time.time())
        nonce = "nonce-1"
        goal = "Bygg demo med signering"
        sig = sign_message(goal, nonce=nonce, ts=now)
        run_resp = client.post(
            "/run",
            json={"goal": goal},
            headers={"x-nonce": nonce, "x-ts": str(now), "x-sig": sig},
        )
        assert run_resp.status_code == 200
        run_id = run_resp.json()["run_id"]

        cp = client.get(f"/runs/{run_id}/critical-path")
        assert cp.status_code == 200
        assert cp.json()["total_latency_ms"] >= 0

        replay = client.post(
            "/run",
            json={"goal": goal},
            headers={"x-nonce": nonce, "x-ts": str(now), "x-sig": sig},
        )
        assert replay.status_code == 409
