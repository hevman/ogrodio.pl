#!/usr/bin/env bash
# Szybki restart stacku bez rebuildu

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi

export COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-ogrodio}"

docker compose -f docker-compose.yml -f docker-compose.prod.yml restart
echo "Restart zakończony. bash deploy/status.sh"
