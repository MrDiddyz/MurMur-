from __future__ import annotations

import json
import os
from dataclasses import dataclass
from pathlib import Path
from typing import Iterable


DEFAULT_MODEL_WEIGHTS = [0.0, 0.0, 0.0, 0.0]
SOFT_UPDATE_ACCOUNT_FACTOR = 0.8
SOFT_UPDATE_GLOBAL_FACTOR = 0.2


@dataclass(frozen=True)
class CrossLearningConfig:
    ml_global_enabled: bool = True
    ml_cluster_enabled: bool = True
    global_update_interval: int = 50

    @classmethod
    def from_env(cls) -> "CrossLearningConfig":
        return cls(
            ml_global_enabled=_env_bool("ML_GLOBAL_ENABLED", True),
            ml_cluster_enabled=_env_bool("ML_CLUSTER_ENABLED", True),
            global_update_interval=int(os.getenv("GLOBAL_UPDATE_INTERVAL", "50")),
        )


def _env_bool(key: str, default: bool) -> bool:
    value = os.getenv(key)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _model_payload(weights: list[float], score: float = 0.0) -> dict[str, object]:
    return {
        "weights": [float(w) for w in weights],
        "score": float(score),
    }


def _load_model(path: Path, *, default_weights: list[float] | None = None) -> dict[str, object]:
    if not path.exists():
        weights = DEFAULT_MODEL_WEIGHTS if default_weights is None else default_weights
        return _model_payload(weights)

    with path.open("r", encoding="utf-8") as file:
        loaded = json.load(file)

    weights = loaded.get("weights", DEFAULT_MODEL_WEIGHTS)
    score = float(loaded.get("score", 0.0))
    return _model_payload([float(w) for w in weights], score)


def _save_model(path: Path, payload: dict[str, object]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8") as file:
        json.dump(payload, file, indent=2)


def merge_weights(weight_sets: Iterable[Iterable[float]]) -> list[float]:
    normalized = [[float(v) for v in weights] for weights in weight_sets]
    if not normalized:
        return list(DEFAULT_MODEL_WEIGHTS)

    width = len(normalized[0])
    sums = [0.0] * width
    for weights in normalized:
        if len(weights) != width:
            raise ValueError("All weight vectors must have equal length")
        for index, value in enumerate(weights):
            sums[index] += value

    count = len(normalized)
    return [value / count for value in sums]


def soft_update_weights(account_weights: Iterable[float], global_weights: Iterable[float]) -> list[float]:
    account = [float(v) for v in account_weights]
    global_model = [float(v) for v in global_weights]
    if len(account) != len(global_model):
        raise ValueError("Account and global weight vectors must have equal length")

    return [
        SOFT_UPDATE_ACCOUNT_FACTOR * account_weight + SOFT_UPDATE_GLOBAL_FACTOR * global_weight
        for account_weight, global_weight in zip(account, global_model)
    ]


def cluster_key(follower_count: int, niche: str) -> str:
    if follower_count < 10_000:
        bucket = "small"
    elif follower_count < 100_000:
        bucket = "medium"
    else:
        bucket = "large"

    normalized_niche = (niche or "general").strip().lower() or "general"
    return f"{bucket}__{normalized_niche}"


class CrossLearningEngine:
    def __init__(self, base_path: str | Path = "data", config: CrossLearningConfig | None = None) -> None:
        self.base_path = Path(base_path)
        self.config = config or CrossLearningConfig.from_env()
        self.models_path = self.base_path / "models"
        self.accounts_path = self.models_path / "accounts"
        self.cluster_models_path = self.models_path / "cluster_models"
        self.global_model_path = self.models_path / "global_model.json"
        self.cycles = 0

        if self.config.ml_global_enabled and not self.global_model_path.exists():
            _save_model(self.global_model_path, _model_payload(DEFAULT_MODEL_WEIGHTS, 0.0))

    def initialize_account_model(self, account_id: str) -> Path:
        account_path = self.accounts_path / f"{account_id}.json"
        if account_path.exists():
            return account_path

        global_model = _load_model(self.global_model_path)
        _save_model(account_path, global_model)
        return account_path

    def train_cycle(self, account_batch: list[dict[str, object]]) -> dict[str, object]:
        self.cycles += 1
        global_candidates: list[list[float]] = []
        global_improved = False

        for account in account_batch:
            account_id = str(account["account_id"])
            niche = str(account.get("niche", "general"))
            follower_count = int(account.get("follower_count", 0))
            replay_buffer = account.get("replay_buffer", [])

            self.initialize_account_model(account_id)
            account_path = self.accounts_path / f"{account_id}.json"
            model = _load_model(account_path)
            current_weights = [float(v) for v in model["weights"]]

            trained_weights = self._train_on_replay(current_weights, replay_buffer)
            model["weights"] = trained_weights
            model["score"] = self._score_weights(trained_weights)
            _save_model(account_path, model)
            global_candidates.append(trained_weights)

            if self.config.ml_cluster_enabled:
                self._share_cluster_weights(account_path, follower_count, niche)

        if (
            self.config.ml_global_enabled
            and global_candidates
            and self.cycles % self.config.global_update_interval == 0
        ):
            global_improved = self._update_global_model(global_candidates)

        if global_improved:
            global_weights = _load_model(self.global_model_path)["weights"]
            for account in account_batch:
                account_path = self.accounts_path / f"{account['account_id']}.json"
                model = _load_model(account_path)
                model["weights"] = soft_update_weights(model["weights"], global_weights)
                model["score"] = self._score_weights(model["weights"])
                _save_model(account_path, model)

        return {
            "cross_learning_active": True,
            "global_model_updated": global_improved,
            "cluster_training_enabled": self.config.ml_cluster_enabled,
        }

    def _train_on_replay(self, current_weights: list[float], replay_buffer: object) -> list[float]:
        transitions = replay_buffer if isinstance(replay_buffer, list) else []
        if not transitions:
            return current_weights

        reward_sum = 0.0
        for transition in transitions:
            reward_sum += float(transition.get("reward", 0.0)) if isinstance(transition, dict) else 0.0

        average_reward = reward_sum / max(len(transitions), 1)
        learning_rate = 0.05
        return [weight + learning_rate * average_reward for weight in current_weights]

    def _update_global_model(self, candidates: list[list[float]]) -> bool:
        global_model = _load_model(self.global_model_path)
        merged = merge_weights(candidates)
        merged_score = self._score_weights(merged)
        current_score = float(global_model.get("score", 0.0))

        if merged_score <= current_score:
            return False

        _save_model(self.global_model_path, _model_payload(merged, merged_score))
        return True

    def _share_cluster_weights(self, account_path: Path, follower_count: int, niche: str) -> None:
        model = _load_model(account_path)
        account_weights = [float(v) for v in model["weights"]]

        key = cluster_key(follower_count, niche)
        cluster_path = self.cluster_models_path / f"{key}.json"
        cluster_model = _load_model(cluster_path, default_weights=account_weights)

        shared = [
            0.7 * account_weight + 0.3 * cluster_weight
            for account_weight, cluster_weight in zip(account_weights, cluster_model["weights"])
        ]
        model["weights"] = shared
        model["score"] = self._score_weights(shared)

        cluster_model["weights"] = merge_weights([cluster_model["weights"], shared])
        cluster_model["score"] = self._score_weights(cluster_model["weights"])

        _save_model(account_path, model)
        _save_model(cluster_path, cluster_model)

    @staticmethod
    def _score_weights(weights: Iterable[float]) -> float:
        values = [float(v) for v in weights]
        return sum(values) / max(len(values), 1)
