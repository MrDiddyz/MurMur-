.PHONY: up migrate verify

up:
	docker compose up -d db

migrate:
	docker compose run --rm migrator

verify:
	docker compose -f docker-compose.verify.yml --env-file .env up --abort-on-container-exit --exit-code-from migrator
