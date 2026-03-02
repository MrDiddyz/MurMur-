import tempfile
import unittest
from pathlib import Path

from modules.cross_learning import (
    CrossLearningConfig,
    CrossLearningEngine,
    cluster_key,
    merge_weights,
    soft_update_weights,
)


class CrossLearningMathTests(unittest.TestCase):
    def test_model_merge(self) -> None:
        merged = merge_weights([[1, 2, 3], [3, 4, 5]])
        self.assertEqual(merged, [2.0, 3.0, 4.0])

    def test_soft_update_correctness(self) -> None:
        updated = soft_update_weights([1.0, 2.0], [3.0, 4.0])
        self.assertAlmostEqual(updated[0], 1.4)
        self.assertAlmostEqual(updated[1], 2.4)

    def test_cluster_grouping(self) -> None:
        self.assertEqual(cluster_key(9000, "music"), "small__music")
        self.assertEqual(cluster_key(40_000, "music"), "medium__music")
        self.assertEqual(cluster_key(400_000, "music"), "large__music")


class CrossLearningEngineTests(unittest.TestCase):
    def test_account_init_uses_global_model(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            engine = CrossLearningEngine(base_path=tmpdir)
            account_path = engine.initialize_account_model("acct-1")
            self.assertTrue(account_path.exists())
            account_model = account_path.read_text(encoding="utf-8")
            global_model = (Path(tmpdir) / "models" / "global_model.json").read_text(encoding="utf-8")
            self.assertEqual(account_model, global_model)

    def test_periodic_global_update_and_soft_transfer(self) -> None:
        with tempfile.TemporaryDirectory() as tmpdir:
            engine = CrossLearningEngine(
                base_path=tmpdir,
                config=CrossLearningConfig(
                    ml_global_enabled=True,
                    ml_cluster_enabled=True,
                    global_update_interval=1,
                ),
            )

            result = engine.train_cycle(
                [
                    {
                        "account_id": "acct-1",
                        "follower_count": 15000,
                        "niche": "music",
                        "replay_buffer": [{"reward": 2.0}, {"reward": 2.0}],
                    },
                    {
                        "account_id": "acct-2",
                        "follower_count": 16000,
                        "niche": "music",
                        "replay_buffer": [{"reward": 1.0}, {"reward": 1.0}],
                    },
                ]
            )

            self.assertTrue(result["cross_learning_active"])
            self.assertTrue(result["global_model_updated"])
            self.assertTrue(result["cluster_training_enabled"])

            global_model_path = Path(tmpdir) / "models" / "global_model.json"
            self.assertTrue(global_model_path.exists())

            cluster_path = Path(tmpdir) / "models" / "cluster_models" / "medium__music.json"
            self.assertTrue(cluster_path.exists())


if __name__ == "__main__":
    unittest.main()
