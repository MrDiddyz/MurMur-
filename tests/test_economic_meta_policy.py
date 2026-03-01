from pathlib import Path

from economic_meta_policy import (
    MAX_PRICE,
    MIN_PRICE,
    REWARD_CLIP,
    apply_price_update,
    compute_reward,
    load_policy,
    meta_economic_step,
    policy,
    policy_forward,
    reset_policy,
    save_policy,
    state_vector,
    update_policy,
)


def _belief():
    return {
        "cpu": {"us-east": 0.7, "eu-west": 0.60},
        "queue": {"us-east": 90, "eu-west": 20},
        "latency": {"us-east": 280, "eu-west": 200},
        "error": {"us-east": 0.03, "eu-west": 0.01},
    }


def test_apply_price_update_bounds():
    assert apply_price_update(0.2, -100) == MIN_PRICE
    assert apply_price_update(9.5, 100) == MAX_PRICE


def test_compute_reward_uses_region_specific_metrics():
    belief = _belief()

    east_reward = compute_reward(belief, "us-east", price=1.0, demand=100)
    west_reward = compute_reward(belief, "eu-west", price=1.0, demand=100)

    assert east_reward < west_reward


def test_compute_reward_clips_negative_demand_to_zero():
    belief = _belief()
    reward_negative = compute_reward(belief, "us-east", price=2.0, demand=-100)
    reward_zero = compute_reward(belief, "us-east", price=2.0, demand=0)

    assert reward_negative == reward_zero


def test_policy_forward_can_run_without_exploration_noise():
    belief = _belief()
    s = state_vector(belief, "us-east", current_price=1.0)

    first = policy_forward(s, explore=False)
    second = policy_forward(s, explore=False)

    assert first == second


def test_update_policy_clips_large_reward_for_stability():
    old_w = list(policy["w"])
    old_b = policy["b"]

    state = [1.0, 1.0, 1.0, 1.0, 1.0]
    update_policy(state, reward=10_000)

    max_allowed_step = REWARD_CLIP * 0.01
    deltas = [new - old for old, new in zip(old_w, policy["w"])]

    assert all(delta <= max_allowed_step for delta in deltas)
    assert policy["b"] - old_b <= max_allowed_step

    policy["w"] = old_w
    policy["b"] = old_b


def test_meta_economic_step_returns_all_regions():
    belief = _belief()
    prices = {"us-east": 1.2}
    demand = {"us-east": 120, "eu-west": 80}

    new_prices, rewards = meta_economic_step(belief, prices, demand, explore=False)

    assert set(new_prices.keys()) == {"us-east", "eu-west"}
    assert set(rewards.keys()) == {"us-east", "eu-west"}
    assert all(MIN_PRICE <= p <= MAX_PRICE for p in new_prices.values())


def test_policy_persistence_supports_new_paths(tmp_path: Path):
    old_w = list(policy["w"])
    old_b = policy["b"]

    policy["w"] = [0.1, 0.2, 0.3, 0.4, 0.5]
    policy["b"] = 1.25

    nested_path = tmp_path / "artifacts" / "pricing" / "policy.json"
    saved_path = save_policy(nested_path)

    policy["w"] = [9, 9, 9, 9, 9]
    policy["b"] = -9

    loaded = load_policy(saved_path)

    assert loaded is True
    assert policy["w"] == [0.1, 0.2, 0.3, 0.4, 0.5]
    assert policy["b"] == 1.25

    policy["w"] = old_w
    policy["b"] = old_b


def test_load_policy_returns_false_for_missing_path(tmp_path: Path):
    missing = tmp_path / "does-not-exist" / "policy.json"
    assert load_policy(missing) is False


def test_reset_policy_is_deterministic_with_seed():
    reset_policy(seed=123)
    first = list(policy["w"]), policy["b"]
    reset_policy(seed=123)
    second = list(policy["w"]), policy["b"]

    assert first == second
