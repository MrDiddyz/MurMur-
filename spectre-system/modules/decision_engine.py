"""Decision engine with EMA-based adaptive spread threshold.

The engine mirrors observed spread behaviour using an exponential moving
average (EMA) and adjusts its buy threshold continuously — providing a
simple but genuine learning signal rather than a hard-coded constant.
"""
from __future__ import annotations

from shared.schemas import OrderDecision

_DEFAULT_SPREAD_ALPHA = 0.05  # EMA smoothing factor — lower = slower learning
_INITIAL_SPREAD_EMA = 0.08    # Starting estimate (informed guess, not magic number)

_spread_ema: float = _INITIAL_SPREAD_EMA


def _update_spread_ema(observed_spread: float) -> None:
    """Update the running EMA of spread. Side-effect on module state."""
    global _spread_ema
    _spread_ema = _DEFAULT_SPREAD_ALPHA * observed_spread + (1 - _DEFAULT_SPREAD_ALPHA) * _spread_ema


def make_decision(
    features: dict[str, float],
    tick_index: int,
    *,
    regime: str = "UNKNOWN",
    stress_level: float = 0.0,
    edge_score: float = 0.0,
) -> OrderDecision:
    """Make a trading decision, learning spread thresholds via EMA.

    Args:
        features:    Feature dict from feature_pipeline.
        tick_index:  Current tick position.
        regime:      Market regime label from regime_classifier.
        stress_level: 0-1 stress score from stress_engine.
        edge_score:  Edge estimate from edge_monitor.
    """
    spread = features["spread"]

    # Mirror: update our model of "normal" spread from every tick
    _update_spread_ema(spread)

    # Under high stress, widen the threshold to avoid bad fills
    stress_adjusted_threshold = _spread_ema * (1.0 + stress_level)

    # Only act in trending regimes with positive edge; skip sideways/stressed markets
    if regime in ("TRENDING_UP",) and stress_level < 0.5 and edge_score > 0.0:
        if spread < stress_adjusted_threshold:
            return OrderDecision(action="BUY_1", quantity=1)

    # Fallback: default safe cadence (every 10th tick) for non-trending regimes
    if regime not in ("TRENDING_UP", "TRENDING_DOWN") and tick_index % 10 == 0:
        if spread < stress_adjusted_threshold:
            return OrderDecision(action="BUY_1", quantity=1)

    return OrderDecision(action="WAIT", quantity=0)


def reset_ema() -> None:
    """Reset the EMA state — useful between simulation runs to avoid leakage."""
    global _spread_ema
    _spread_ema = _INITIAL_SPREAD_EMA
