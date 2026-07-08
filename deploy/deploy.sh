#!/usr/bin/env bash
# Build + start produkcji
#   bash deploy/deploy.sh           — normalny deploy (HTTPS)
#   bash deploy/deploy.sh bootstrap — pierwszy deploy (HTTP, przed SSL)

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ -d .git ]; then
  echo "==> Aktualizacja kodu (git pull)"
  git fetch origin main
  git pull --ff-only origin main
fi

MODE="${1:-}"

COMPOSE="docker compose -f docker-compose.yml -f docker-compose.prod.yml"

if [ -f .env ]; then
  # shellcheck disable=SC1091
  source "$(dirname "$0")/lib/load-env.sh"
  fix_env_file .env
  load_env_file .env
fi

export COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-ogrodio}"
export NGINX_CONF="${NGINX_CONF:-nginx.prod.conf}"

if ! docker info >/dev/null 2>&1; then
  echo "Brak dostępu do Docker (permission denied)."
  echo "Napraw: sudo usermod -aG docker $USER && newgrp docker"
  echo "Albo:  sudo bash deploy/deploy.sh"
  exit 1
fi

if [ ! -f .env ]; then
  echo "Brak .env — cp .env.production.example .env"
  exit 1
fi

if [ "$MODE" = "bootstrap" ] || [ "${NGINX_CONF:-nginx.prod.conf}" = "nginx.prod-bootstrap.conf" ]; then
  echo "==> Bootstrap: nginx HTTP (bez SSL) — tylko bez Cloudflare / przed Origin Cert"
  NGINX_CONF=nginx.prod-bootstrap.conf $COMPOSE up -d --build
  echo "Stack działa na porcie 80."
  echo "Z Cloudflare: wystaw Origin Certificate → deploy/ssl/ → bash deploy/deploy.sh"
  exit 0
fi

if [ "${SKIP_SSL_VERIFY:-}" != "1" ]; then
  echo "==> Weryfikacja certyfikatu SSL (Cloudflare Origin)"
  bash deploy/verify-ssl.sh
fi

echo "==> Build obrazów (może zająć 10–20 min na 2 vCPU)"
$COMPOSE build

echo "==> Start kontenerów"
$COMPOSE up -d

echo "==> Czekam na Postgres..."
sleep 15

echo "==> Sync artykułów do bazy + Meilisearch"
docker exec garden-backend node src/scripts/sync-articles-from-files.js || true

echo "==> Indeks artykułów Meili"
docker exec garden-backend node src/scripts/index-articles-simple.js || true

echo ""
echo "Deploy zakończony."
echo "  Health: curl -s https://ogrodio.pl/health"
echo "  Logi:   docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f"
