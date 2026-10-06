.PHONY: dev build new publish check stop logs
COMPOSE ?= $(shell docker compose version >/dev/null 2>&1 && echo 'docker compose' || echo 'docker-compose')
export TITLE CATEGORY SLUG FORMAT MSG

dev:
	$(COMPOSE) up --build

build:
	$(COMPOSE) run --rm --build web npm run build

check:
	$(COMPOSE) run --rm --build web npm run check

new:
	$(COMPOSE) run --rm --build -e TITLE -e CATEGORY -e SLUG -e FORMAT \
		-v "$(CURDIR)/src:/app/src:rw" web node scripts/new-article.mjs

publish:
	bash scripts/publish.sh

stop:
	$(COMPOSE) down

logs:
	$(COMPOSE) logs --follow web
