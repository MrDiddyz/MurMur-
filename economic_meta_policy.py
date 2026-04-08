import json
import random
from pathlib import Path
from typing import Dict, Iterable, List, Tuple

# learning rate
LR = 0.01

# exploration noise
SIGMA = 0.05

# gradient/reward stability
REWARD_CLIP = 100.0

# price bounds
MIN_PRICE = 0.1
MAX_PRICE = 10.0

TARGET_UTIL = 0.65
TARGET_LATENCY = 250
TARGET_ERROR = 0.02

POLICY_PATH = Path("pricing_policy.json")


def _init_weights() -> List[float]:
    return [random.gauss(0.0, 0.01) for _ in range(5)]


# policy parameters (learned)
# simple linear policy: Δp = w · state + b
policy = {
    "w": _init_weights(),
    "b": 0.0,
}


def _dot(left: Iterable[float], right: Iterable[float]) -> float:
    return sum(a * b for a, b in zip(left, right))


def _clip(value: float, low: float, high: float) -> float:
    return max(low, min(high, value))


def reset_policy(seed: int | None = None) -> None:
    if seed is not None:
        random.seed(seed)
    policy["w"] = _init_weights()
    policy["b"] = 0.0


def state_vector(belief: Dict, region: str, current_price: float) -> List[float]:
    util = float(belief["cpu"][region])
    queue = float(belief["queue"][region])
    latency = float(belief["latency"][region])
    error = float(belief["error"][region])

    return [
        util - TARGET_UTIL,
        queue / 100,
        (latency - TARGET_LATENCY) / 100,
        error - TARGET_ERROR,
        current_price,
    ]


def policy_forward(state: List[float], explore: bool = True) -> float:
    delta = _dot(policy["w"], state) + policy["b"]

    if explore:
        delta += random.gauss(0.0, SIGMA)

    return float(delta)


def apply_price_update(price: float, delta: float) -> float:
    return float(_clip(price + delta, MIN_PRICE, MAX_PRICE))


def compute_reward(belief: Dict, region: str, price: float, demand: float) -> float:
    safe_demand = max(0.0, float(demand))
    revenue = price * safe_demand

    util = float(belief["cpu"][region])
    latency = float(belief["latency"][region])
    error = float(belief["error"][region])

    overload_penalty = max(0.0, util - TARGET_UTIL) * 10
    latency_penalty = max(0.0, latency - TARGET_LATENCY)
    error_penalty = max(0.0, error - TARGET_ERROR) * 50

    return float(revenue - overload_penalty - latency_penalty - error_penalty)


def update_policy(state: List[float], reward: float) -> None:
    stable_reward = _clip(float(reward), -REWARD_CLIP, REWARD_CLIP)

    policy["w"] = [w + LR * value * stable_reward for w, value in zip(policy["w"], state)]
    policy["b"] += LR * stable_reward


def meta_price_step(
    region: str,
    belief: Dict,
    prev_price: float,
    demand: float,
    explore: bool = True,
) -> Tuple[float, float]:
    s = state_vector(belief, region, prev_price)
    delta = policy_forward(s, explore=explore)
    new_price = apply_price_update(prev_price, delta)
    reward = compute_reward(belief, region, new_price, demand)
    update_policy(s, reward)

    return new_price, reward


def meta_economic_step(
    belief: Dict,
    prices: Dict[str, float],
    demand: Dict[str, float],
    explore: bool = True,
):
    new_prices = {}
    rewards = {}

    for region in belief["cpu"]:
        price, reward = meta_price_step(
            region,
            belief,
            prices.get(region, 1.0),
            demand.get(region, 100),
            explore=explore,
        )
        new_prices[region] = price
        rewards[region] = reward

    return new_prices, rewards


def save_policy(path=POLICY_PATH) -> Path:
    policy_path = Path(path)
    policy_path.parent.mkdir(parents=True, exist_ok=True)

    with policy_path.open("w", encoding="utf-8") as f:
        json.dump({"w": policy["w"], "b": policy["b"]}, f)

    return policy_path


def load_policy(path=POLICY_PATH) -> bool:
    policy_path = Path(path)
    if not policy_path.exists():
        return False

    with policy_path.open(encoding="utf-8") as f:
        data = json.load(f)

    loaded_w = data.get("w")
    loaded_b = data.get("b")
    if not isinstance(loaded_w, list) or len(loaded_w) != 5:
        raise ValueError("Invalid policy format: 'w' must be a list of 5 numeric values")

    policy["w"] = [float(value) for value in loaded_w]
    policy["b"] = float(loaded_b)
    return True
