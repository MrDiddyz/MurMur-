import unittest

from fastapi import HTTPException

from app import AvatarOperateRequest, AvatarTask, run_avatar_operator


class AvatarOperatorTests(unittest.TestCase):
    def _request(self, task: AvatarTask) -> AvatarOperateRequest:
        return AvatarOperateRequest(
            avatar_core={"voice": "locked"},
            context={"campaign": "spring"},
            memory={"recent": []},
            task=task,
            constraints={"platform": "x"},
            telemetry={"kpis": {}},
        )

    def test_rejects_empty_avatar_core(self) -> None:
        req = AvatarOperateRequest(
            avatar_core={},
            context={},
            memory={},
            task=AvatarTask.CONTENT_CREATOR,
            constraints={},
            telemetry={},
        )

        with self.assertRaises(HTTPException):
            run_avatar_operator(req)

    def test_content_creator_shape(self) -> None:
        payload = run_avatar_operator(self._request(AvatarTask.CONTENT_CREATOR))
        self.assertEqual(payload["task"], "content_creator")
        self.assertTrue(payload["outputs"]["content"])
        self.assertEqual(payload["outputs"]["dm_replies"], [])

    def test_offer_seller_shape(self) -> None:
        payload = run_avatar_operator(self._request(AvatarTask.OFFER_SELLER))
        self.assertTrue(payload["outputs"]["dm_replies"])
        item = payload["outputs"]["dm_replies"][0]
        self.assertIn("next_step_question", item)

    def test_decision_engine_includes_not_to_do(self) -> None:
        payload = run_avatar_operator(self._request(AvatarTask.DECISION_ENGINE))
        self.assertTrue(payload["outputs"]["decisions"])
        item = payload["outputs"]["decisions"][0]
        self.assertIn("not_to_do", item)

    def test_daily_operator_contains_experiments(self) -> None:
        payload = run_avatar_operator(self._request(AvatarTask.DAILY_OPERATOR))
        self.assertTrue(payload["outputs"]["ops"])
        item = payload["outputs"]["ops"][0]
        self.assertIn("next_experiments", item)


if __name__ == "__main__":
    unittest.main()
