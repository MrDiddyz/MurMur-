.PHONY: quality test

quality:
	ruff check src tests
	mypy src
	pytest -q

test:
	pytest -q
