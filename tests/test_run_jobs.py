import unittest

from fastapi.testclient import TestClient

from app import app


class RunJobApiTests(unittest.TestCase):
    def setUp(self) -> None:
        self.client = TestClient(app)

    def test_create_job_returns_headers_and_job_id(self) -> None:
        response = self.client.post(
            "/v1/run",
            json={"input": {"prompt": "hello"}, "instance_id": "dev-1", "policy_version": "2026-01"},
        )

        self.assertEqual(response.status_code, 200)
        body = response.json()
        self.assertIn("job_id", body)
        self.assertTrue(body["job_id"])
        self.assertEqual(response.headers["X-Run-Id"], body["job_id"])
        self.assertEqual(response.headers["X-Instance-Id"], "dev-1")
        self.assertEqual(response.headers["X-Policy-Version"], "2026-01")

    def test_job_retrieval_completed_result(self) -> None:
        create = self.client.post("/v1/run", json={"input": {"prompt": "complete me"}})
        job_id = create.json()["job_id"]

        job = self.client.get(f"/v1/jobs/{job_id}")
        self.assertEqual(job.status_code, 200)
        payload = job.json()
        self.assertEqual(payload["status"], "completed")
        self.assertIsNone(payload["error"])
        self.assertEqual(payload["result"]["provider"], "primary")
        self.assertEqual(payload["result"]["output"], "complete me")

    def test_job_retrieval_fallback_result(self) -> None:
        create = self.client.post("/v1/run", json={"input": {"prompt": "fallback", "force_fallback": True}})
        job_id = create.json()["job_id"]

        job = self.client.get(f"/v1/jobs/{job_id}")
        self.assertEqual(job.status_code, 200)
        payload = job.json()
        self.assertEqual(payload["status"], "completed")
        self.assertEqual(payload["result"]["provider"], "fallback")

    def test_job_retrieval_deterministic_failure(self) -> None:
        create = self.client.post("/v1/run", json={"simulate_failure": True})
        job_id = create.json()["job_id"]

        job = self.client.get(f"/v1/jobs/{job_id}")
        self.assertEqual(job.status_code, 200)
        payload = job.json()
        self.assertEqual(payload["status"], "failed")
        self.assertEqual(payload["error"]["code"], "AGENT_EXECUTION_FAILED")

    def test_job_not_found_returns_deterministic_error(self) -> None:
        response = self.client.get("/v1/jobs/does-not-exist")
        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()["detail"]["code"], "JOB_NOT_FOUND")


if __name__ == "__main__":
    unittest.main()
