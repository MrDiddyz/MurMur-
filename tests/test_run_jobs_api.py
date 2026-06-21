import unittest
from uuid import UUID

from fastapi.testclient import TestClient

from app import app


class RunJobsApiTests(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)

    def test_create_job_and_fetch_successful_result_with_trace_headers(self) -> None:
        create = self.client.post(
            "/v1/run",
            json={"prompt": "draft a launch note", "agent": "copywriter"},
        )
        self.assertEqual(create.status_code, 202)
        self.assertIn("X-Run-Id", create.headers)
        self.assertIn("X-Instance-Id", create.headers)
        self.assertIn("X-Policy-Version", create.headers)

        payload = create.json()
        self.assertIn("job_id", payload)
        UUID(payload["job_id"])

        read = self.client.get(f"/v1/jobs/{payload['job_id']}")
        self.assertEqual(read.status_code, 200)
        self.assertEqual(read.headers["X-Run-Id"], payload["job_id"])
        body = read.json()

        self.assertEqual(body["status"], "completed")
        self.assertIsNone(body["error"])
        self.assertEqual(body["result"]["agent"], "copywriter")
        self.assertFalse(body["result"]["fallback"])

    def test_create_job_uses_fallback_when_optional_llm_unavailable(self) -> None:
        create = self.client.post(
            "/v1/run",
            json={
                "prompt": "generate plan",
                "simulate_llm_unavailable": True,
            },
        )
        self.assertEqual(create.status_code, 202)
        job_id = create.json()["job_id"]

        read = self.client.get(f"/v1/jobs/{job_id}")
        self.assertEqual(read.status_code, 200)
        body = read.json()

        self.assertEqual(body["status"], "completed")
        self.assertIsNone(body["error"])
        self.assertTrue(body["result"]["fallback"])
        self.assertEqual(body["result"]["provider"], "rule_based_fallback")

    def test_create_job_returns_deterministic_failure_path(self) -> None:
        create = self.client.post(
            "/v1/run",
            json={
                "prompt": "simulate crash",
                "simulate_agent_error": True,
            },
        )
        self.assertEqual(create.status_code, 202)
        job_id = create.json()["job_id"]

        read = self.client.get(f"/v1/jobs/{job_id}")
        self.assertEqual(read.status_code, 200)
        body = read.json()

        self.assertEqual(body["status"], "failed")
        self.assertIsNone(body["result"])
        self.assertEqual(body["error"]["code"], "AGENT_EXECUTION_ERROR")

    def test_get_unknown_job_returns_deterministic_404_error(self) -> None:
        unknown = "00000000-0000-0000-0000-000000000000"
        read = self.client.get(f"/v1/jobs/{unknown}")
        self.assertEqual(read.status_code, 404)
        self.assertEqual(
            read.json(),
            {
                "detail": {
                    "code": "JOB_NOT_FOUND",
                    "message": "No job exists for the requested job_id.",
                }
            },
        )


if __name__ == "__main__":
    unittest.main()
