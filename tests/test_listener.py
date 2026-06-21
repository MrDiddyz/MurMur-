import importlib.util
import unittest
from types import SimpleNamespace
from unittest.mock import patch

HAS_OPENAI = importlib.util.find_spec("openai") is not None

if HAS_OPENAI:
    from modules import listener


@unittest.skipUnless(HAS_OPENAI, "openai package is not installed in this environment")
class ListenerTests(unittest.TestCase):
    def _mock_response(self, content: str):
        return SimpleNamespace(
            choices=[SimpleNamespace(message=SimpleNamespace(content=content))]
        )

    def test_run_listener_uses_json_schema_response_format(self) -> None:
        payload = '{"intent":"sell","niche":"general","goals":[],"obstacles":[],"signals":[],"ok":true}'

        with patch.object(
            listener.client.chat.completions,
            "create",
            return_value=self._mock_response(payload),
        ) as mock_create:
            result = listener.run_listener("Test input")

        self.assertTrue(result["ok"])
        kwargs = mock_create.call_args.kwargs
        self.assertEqual(kwargs["response_format"]["type"], "json_schema")
        self.assertEqual(
            kwargs["response_format"]["json_schema"]["name"],
            listener.LISTENER_RESPONSE_SCHEMA["name"],
        )

    def test_run_listener_returns_error_payload_on_invalid_json(self) -> None:
        with patch.object(
            listener.client.chat.completions,
            "create",
            return_value=self._mock_response("not-json"),
        ):
            result = listener.run_listener("Need help with Stripe checkout")

        self.assertFalse(result["ok"])
        self.assertEqual(result["error"], "invalid_json")
        self.assertEqual(result["niche"], "payments")


if __name__ == "__main__":
    unittest.main()
