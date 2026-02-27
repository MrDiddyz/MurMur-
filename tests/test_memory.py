import json
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from modules import memory


class MemoryStateTests(unittest.TestCase):
    def test_load_state_returns_default_on_invalid_json(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            state_path = Path(tmpdir) / "runtime-state.json"
            state_path.write_text("{not-valid-json", encoding="utf-8")

            with patch.object(memory, "STATE_PATH", state_path):
                state = memory.load_state()

            self.assertEqual(state.interactions, 0)
            self.assertEqual(state.niche, memory.DEFAULT_STATE.niche)
            self.assertEqual(state.top_goals, [])
            self.assertEqual(state.top_obstacles, [])

    def test_load_state_normalizes_and_caps_items(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            state_path = Path(tmpdir) / "runtime-state.json"
            payload = {
                "interactions": "7",
                "niche": "  ",
                "top_goals": [
                    "Goal A",
                    "goal a",
                    " ",
                    "Goal B",
                    *[f"G{i}" for i in range(1, 20)],
                ],
                "top_obstacles": ["Obs1", "obs1", "Obs2"],
            }
            state_path.write_text(json.dumps(payload), encoding="utf-8")

            with patch.object(memory, "STATE_PATH", state_path):
                state = memory.load_state()

            self.assertEqual(state.interactions, 7)
            self.assertEqual(state.niche, memory.DEFAULT_STATE.niche)
            self.assertEqual(len(state.top_goals), memory.MAX_STATE_ITEMS)
            self.assertEqual(state.top_goals[0], "Goal A")
            self.assertEqual(state.top_obstacles, ["Obs1", "Obs2"])

    def test_update_from_listener_limits_saved_state(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            state_path = Path(tmpdir) / "runtime-state.json"
            state_path.write_text(
                json.dumps(
                    {
                        "interactions": 0,
                        "niche": "test",
                        "top_goals": [f"Old Goal {i}" for i in range(memory.MAX_STATE_ITEMS)],
                        "top_obstacles": [f"Old Obstacle {i}" for i in range(memory.MAX_STATE_ITEMS)],
                    }
                ),
                encoding="utf-8",
            )

            listener_output = {
                "goals": ["New Goal"],
                "obstacles": ["New Obstacle"],
                "niche": "updated-niche",
            }

            with patch.object(memory, "STATE_PATH", state_path):
                state = memory.update_from_listener(listener_output)

            self.assertEqual(state.interactions, 1)
            self.assertEqual(state.niche, "updated-niche")
            self.assertEqual(len(state.top_goals), memory.MAX_STATE_ITEMS)
            self.assertEqual(len(state.top_obstacles), memory.MAX_STATE_ITEMS)
            self.assertIn("New Goal", state.top_goals)
            self.assertIn("New Obstacle", state.top_obstacles)
            self.assertNotIn("Old Goal 0", state.top_goals)
            self.assertNotIn("Old Obstacle 0", state.top_obstacles)


if __name__ == "__main__":
    unittest.main()
