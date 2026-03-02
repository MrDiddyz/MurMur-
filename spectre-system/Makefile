.PHONY: install run test

install:
	poetry install

run:
	poetry run python -m simulation.engine --data simulation/data/sample_ticks.csv

test:
	poetry run pytest -q
