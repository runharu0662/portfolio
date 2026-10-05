#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."
git rev-parse --is-inside-work-tree >/dev/null
git add .
if ! git diff --cached --quiet; then
  git commit -m "${MSG:-docs: update portfolio}"
else
  echo 'No changes to commit; pushing existing commits.'
fi
git push
