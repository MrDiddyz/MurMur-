import unittest

from modules.memory import RuntimeState
from modules.spectre import run_spectre_mode


class SpectreModeTests(unittest.TestCase):
    def test_music_niche_adds_minor_progression(self) -> None:
        state = RuntimeState(
            interactions=2,
            niche="music/psytrance",
            top_goals=["Lage mørk psytrance"],
            top_obstacles=["Mister energi i droppet"],
            affect={"valence": -0.78, "energy": 0.62},
        )

        output = run_spectre_mode(
            "Bygg mørk psytrance låt",
            {
                "goals": ["Lage mørk psytrance med hard groove"],
                "obstacles": ["Få spenningskurve som løser seg ut"],
            },
            state,
        )

        self.assertEqual(output.get("harmony_progression"), ["i", "VI", "III", "VII"])
        self.assertTrue(
            any(
                "i → VI → III → VII" in str(action)
                for action in output.get("next_actions", [])
            )
        )
        snapshot = output.get("state_snapshot", {})
        self.assertEqual(snapshot.get("affect"), state.affect)


if __name__ == "__main__":
    unittest.main()
