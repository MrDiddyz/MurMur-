from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"ok": True}


def test_secure_ping_requires_api_key() -> None:
    response = client.get("/secure/ping")

    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid or missing API key"}


def test_secure_ping_with_api_key() -> None:
    response = client.get("/secure/ping", headers={"X-API-KEY": "dev-api-key"})

    assert response.status_code == 200
    assert response.json() == {"message": "pong"}
