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
                "affect": {
                    "valence": "-1.3",
                    "energy": 1.7,
                    "release_threshold": 0.85,
                    "stability": -0.2,
                    "memory_weight": 0.92,
                    "ignored": 2,
                },
            }
            state_path.write_text(json.dumps(payload), encoding="utf-8")

            with patch.object(memory, "STATE_PATH", state_path):
                state = memory.load_state()

            self.assertEqual(state.interactions, 7)
            self.assertEqual(state.niche, memory.DEFAULT_STATE.niche)
            self.assertEqual(len(state.top_goals), memory.MAX_STATE_ITEMS)
            self.assertEqual(state.top_goals[0], "Goal A")
            self.assertEqual(state.top_obstacles, ["Obs1", "Obs2"])
            self.assertEqual(
                state.affect,
                {
                    "valence": -1.0,
                    "energy": 1.0,
                    "release_threshold": 0.85,
                    "stability": 0.0,
                    "memory_weight": 0.92,
                },
            )

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
                "affect": {
                    "valence": -0.78,
                    "energy": 0.62,
                    "release_threshold": 0.85,
                    "stability": 0.31,
                    "memory_weight": 0.92,
                },
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
            self.assertAlmostEqual(state.affect["valence"], -0.78)
            self.assertAlmostEqual(state.affect["memory_weight"], 0.92)


    def test_update_from_listener_merges_partial_affect(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            state_path = Path(tmpdir) / "runtime-state.json"
            state_path.write_text(
                json.dumps(
                    {
                        "interactions": 3,
                        "niche": "music/psytrance",
                        "top_goals": [],
                        "top_obstacles": [],
                        "affect": {
                            "valence": -0.4,
                            "energy": 0.6,
                            "release_threshold": 0.9,
                        },
                    }
                ),
                encoding="utf-8",
            )

            with patch.object(memory, "STATE_PATH", state_path):
                state = memory.update_from_listener({"affect": {"energy": 0.8}})

            self.assertEqual(state.interactions, 4)
            self.assertEqual(state.affect["valence"], -0.4)
            self.assertEqual(state.affect["release_threshold"], 0.9)
            self.assertEqual(state.affect["energy"], 0.8)


if __name__ == "__main__":
    unittest.main()
