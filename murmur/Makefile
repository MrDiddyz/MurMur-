COMPOSE_FILE=infra/compose/docker-compose.yml

.PHONY: up down restart logs ps check clean smoke config

up:
	docker compose -f $(COMPOSE_FILE) up -d --build

down:
	docker compose -f $(COMPOSE_FILE) down

restart:
	docker compose -f $(COMPOSE_FILE) restart

logs:
	docker compose -f $(COMPOSE_FILE) logs -f --tail=200

ps:
	docker compose -f $(COMPOSE_FILE) ps

config:
	docker compose -f $(COMPOSE_FILE) config

check:
	chmod +x infra/scripts/check_local_stack.sh
	./infra/scripts/check_local_stack.sh

smoke:
	curl -fsS http://localhost:3101/execute \
	  -X POST \
	  -H 'content-type: application/json' \
	  -d '{"request":"plan sprint","priority":"high"}' | jq .

clean:
	docker compose -f $(COMPOSE_FILE) down -v --remove-orphans
