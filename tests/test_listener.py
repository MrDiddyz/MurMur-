import unittest
from pathlib import Path
from tempfile import TemporaryDirectory

from modules import listener


class _FakeResponse:
    def __init__(self, content: str):
        self.choices = [type('Choice', (), {'message': type('Message', (), {'content': content})()})()]


class _FakeCompletions:
    def __init__(self, content: str):
        self._content = content

    def create(self, **kwargs):
        return _FakeResponse(self._content)


class _FakeClient:
    def __init__(self, content: str):
        self.chat = type('Chat', (), {'completions': _FakeCompletions(content)})()


class ListenerTests(unittest.TestCase):
    def test_extract_niche(self):
        self.assertEqual(listener._extract_niche('Lag en psytrance track'), 'psytrance')
        self.assertEqual(listener._extract_niche('Need NextJS TSX component'), 'nextjs')
        self.assertEqual(listener._extract_niche('Hei verden'), 'general')

    def test_parse_json_object_direct(self):
        parsed = listener._parse_json_object('{"ok": true, "topic": "music"}')
        self.assertEqual(parsed, {'ok': True, 'topic': 'music'})

    def test_parse_json_object_embedded(self):
        parsed = listener._parse_json_object('Result:\n```json\n{"ok": true}\n```')
        self.assertEqual(parsed, {'ok': True})

    def test_load_prompt_fallback_when_missing(self):
        with TemporaryDirectory() as td:
            missing = str(Path(td) / 'does-not-exist.txt')
            self.assertEqual(listener._load_listener_prompt(missing), listener.DEFAULT_LISTENER_PROMPT)

    def test_run_listener_returns_fallback_on_non_json(self):
        fake_client = _FakeClient('not-json')
        result = listener.run_listener('hei', client=fake_client)
        self.assertEqual(result['ok'], False)
        self.assertEqual(result['raw'], 'not-json')
        self.assertEqual(result['niche'], 'general')


if __name__ == '__main__':
    unittest.main()
