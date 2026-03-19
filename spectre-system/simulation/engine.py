import argparse

from modules.decision_engine import make_decision
from modules.edge_monitor import evaluate_edge
from modules.execution_simulator import execute
from modules.feature_pipeline import build_features
from modules.portfolio import Portfolio
from modules.regime_classifier import classify_regime
from modules.stress_engine import evaluate_stress
from shared.logging import log_json
from simulation.metrics_collector import MetricsCollector
from simulation.replay_controller import load_events
from simulation.scenario_injector import apply_scenario


def run_simulation(data_path: str) -> dict[str, float | int]:
    events = load_events(data_path)
    metrics = MetricsCollector()
    portfolio = Portfolio()

    for idx, raw_event in enumerate(events):
        event = apply_scenario(raw_event)
        features = build_features(event)
        _regime = classify_regime(features)
        decision = make_decision(features, idx)
        fill = execute(decision, event)
        portfolio.apply_fill(fill)
        state = portfolio.mark(event)
        _stress = evaluate_stress(features)
        _edge = evaluate_edge(features)

        metrics.on_tick()
        metrics.on_fill(fill is not None)

    summary = metrics.final_summary(state)
    log_json("spectre-sim", "INFO", "final_metrics", **summary)
    print(f"FINAL_METRICS {summary}")
    return summary


def main() -> None:
    parser = argparse.ArgumentParser(description="Run Spectre deterministic simulation")
    parser.add_argument("--data", required=True, help="Path to CSV data file")
    args = parser.parse_args()
    run_simulation(args.data)


if __name__ == "__main__":
    main()
