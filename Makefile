.PHONY: dev build new publish check
export TITLE CATEGORY SLUG MSG

dev:
	npm run dev

build:
	npm run build

check:
	npm run check

new:
	bash scripts/new-article.sh

publish:
	bash scripts/publish.sh
