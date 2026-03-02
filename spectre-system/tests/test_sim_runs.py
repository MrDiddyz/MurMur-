from simulation.engine import run_simulation


def test_simulation_runs_end_to_end() -> None:
    summary = run_simulation("simulation/data/sample_ticks.csv")
    assert summary["ticks_processed"] == 200
    assert isinstance(summary["final_pnl"], float)
