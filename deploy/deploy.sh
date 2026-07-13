#!/usr/bin/env bash
# Build + start produkcji
#   bash deploy/deploy.sh           - normalny deploy (HTTPS)
#   bash deploy/deploy.sh bootstrap - pierwszy deploy (HTTP, przed SSL)
#
# Artykuly sa zasilane z JSON-ow. Backend synchronizuje je przed kazdym startem.
# Deploy czeka na gotowy backend i odswieza indeks Meilisearch.
#   SEED_PRODUCTS=1 bash deploy/deploy.sh                - dodaje lub aktualizuje produkty i metody platnosci
#   INDEX_PRODUCTS=1 bash deploy/deploy.sh               - odswieza indeks produktow Meilisearch

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
  echo "Brak dostepu do Docker (permission denied)."
  echo "Napraw: sudo usermod -aG docker \$USER && newgrp docker"
  echo "Albo:  sudo bash deploy/deploy.sh"
  exit 1
fi

if [ ! -f .env ]; then
  echo "Brak .env - cp .env.production.example .env"
  exit 1
fi

require_env() {
  local key="$1"
  if [ -z "${!key:-}" ]; then
    echo "Brak wymaganej wartosci $key w .env. Uruchom jednorazowo: bash deploy/post-install.sh"
    exit 1
  fi
}

for key in \
  GARDEN_JWT_SECRET \
  VENDURE_COOKIE_SECRET \
  MEILISEARCH_MASTER_KEY \
  DIGEST_CRON_SECRET \
  BACKEND_POSTGRES_PASSWORD \
  COMMERCE_POSTGRES_PASSWORD \
  VENDURE_SUPERADMIN_USERNAME \
  VENDURE_SUPERADMIN_PASSWORD; do
  require_env "$key"
done

if [ "$MODE" = "bootstrap" ] || [ "${NGINX_CONF:-nginx.prod.conf}" = "nginx.prod-bootstrap.conf" ]; then
  echo "==> Bootstrap: nginx HTTP (bez SSL) - tylko bez Cloudflare / przed Origin Cert"
  NGINX_CONF=nginx.prod-bootstrap.conf $COMPOSE up -d --build
  echo "Stack dziala na porcie 80."
  echo "Z Cloudflare: wystaw Origin Certificate -> deploy/ssl/ -> bash deploy/deploy.sh"
  exit 0
fi

if [ "${SKIP_SSL_VERIFY:-}" != "1" ]; then
  echo "==> Weryfikacja certyfikatu SSL (Cloudflare Origin)"
  bash deploy/verify-ssl.sh
fi

echo "==> Build obrazow (moze zajac 10-20 min na 2 vCPU)"
$COMPOSE build

echo "==> Start kontenerow"
$COMPOSE up -d

echo "==> Czekam na backend po synchronizacji artykulow"
backend_ready=0
for attempt in $(seq 1 30); do
  if docker exec garden-backend node -e "fetch('http://127.0.0.1:3000/api/articles').then((response) => process.exit(response.ok ? 0 : 1)).catch(() => process.exit(1))"; then
    backend_ready=1
    break
  fi
  sleep 2
done

if [ "$backend_ready" -ne 1 ]; then
  echo "Backend nie uruchomil sie po synchronizacji artykulow."
  docker logs --tail=120 garden-backend
  exit 1
fi

echo "==> Indeks artykulow Meili"
docker exec garden-backend node src/scripts/index-articles-simple.js

if [ "${SEED_PRODUCTS:-}" = "1" ]; then
  echo "==> Produkty i metody platnosci Vendure"
  docker exec \
    -e VENDURE_ADMIN_API_URL=http://commerce-server:3000/admin-api \
    -e VENDURE_SHOP_API_URL=http://commerce-server:3000/shop-api \
    -e VENDURE_SHOP_HOST=sklep.ogrodio.pl \
    garden-commerce-server npm run seed:garden
else
  echo "==> Pomijam seed produktow (SEED_PRODUCTS != 1)"
  echo "    Produkty i platnosci:         SEED_PRODUCTS=1 bash deploy/deploy.sh"
fi

if [ "${INDEX_PRODUCTS:-}" = "1" ]; then
  echo "==> Indeks produktow Meili"
  docker exec \
    -e VENDURE_SHOP_API_URL=http://commerce-server:3000/shop-api \
    -e VENDURE_SHOP_HOST=sklep.ogrodio.pl \
    -e MEILISEARCH_HOST=http://meilisearch:7700 \
    -e MEILISEARCH_MASTER_KEY="${MEILISEARCH_MASTER_KEY}" \
    garden-commerce-server npm run index:meili
else
  echo "==> Pomijam indeks produktow (INDEX_PRODUCTS != 1)"
  echo "    Tylko reindeks produktow:     INDEX_PRODUCTS=1 bash deploy/deploy.sh"
fi

echo ""
echo "Deploy zakonczony."
echo "  Health: curl -s https://ogrodio.pl/health"
echo "  Logi:   docker compose -f docker-compose.yml -f docker-compose.prod.yml logs -f"
