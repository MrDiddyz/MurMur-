from simulation.engine import run_simulation


def test_deterministic_results() -> None:
    first = run_simulation("simulation/data/sample_ticks.csv")
    second = run_simulation("simulation/data/sample_ticks.csv")
    assert first == second
