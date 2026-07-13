#!/usr/bin/env bash
# Build + start produkcji
#   bash deploy/deploy.sh           - normalny deploy (HTTPS)
#   bash deploy/deploy.sh bootstrap - pierwszy deploy (HTTP, przed SSL)
#
# Artykuly NIE sa dotykane podczas zwyklego deployu.
# Jawne tryby:
#   IMPORT_NEW_ARTICLES=1 bash deploy/deploy.sh          - dodaje tylko nowe JSON-y, bez aktualizacji istniejacych
#   UPDATE_ARTICLE_SLUG=slug bash deploy/deploy.sh       - aktualizuje jeden istniejacy artykul z JSON
#   REINDEX_ARTICLES=1 bash deploy/deploy.sh             - odswieza tylko indeks Meilisearch z bazy
#   OVERWRITE_ARTICLES_FROM_JSON=1 bash deploy/deploy.sh - pelny sync JSON -> baza, nadpisuje istniejace tresci
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

if [ "${IMPORT_NEW_ARTICLES:-}" = "1" ] || [ -n "${UPDATE_ARTICLE_SLUG:-}" ] || [ "${REINDEX_ARTICLES:-}" = "1" ] || [ "${OVERWRITE_ARTICLES_FROM_JSON:-}" = "1" ] || [ "${SEED_PRODUCTS:-}" = "1" ] || [ "${INDEX_PRODUCTS:-}" = "1" ]; then
  echo "==> Czekam na Postgres..."
  sleep 15
fi

echo "==> Artykuly: operacje tylko na jawna flage"

if [ "${IMPORT_NEW_ARTICLES:-}" = "1" ]; then
  echo "==> Import nowych artykulow z JSON (bez aktualizacji istniejacych)"
  docker exec garden-backend node src/scripts/import-articles-simple.js
fi

if [ -n "${UPDATE_ARTICLE_SLUG:-}" ]; then
  echo "==> Aktualizacja jednego artykulu z JSON: ${UPDATE_ARTICLE_SLUG}"
  docker exec -e ARTICLE_SLUG="${UPDATE_ARTICLE_SLUG}" garden-backend node src/scripts/sync-one-article-from-file.js
fi

if [ "${OVERWRITE_ARTICLES_FROM_JSON:-}" = "1" ]; then
  echo "==> UWAGA: pelny sync artykulow z JSON nadpisuje istniejace tresci w bazie"
  docker exec garden-backend node src/scripts/sync-articles-from-files.js
else
  echo "==> Pomijam pelny sync artykulow z JSON (OVERWRITE_ARTICLES_FROM_JSON != 1)"
fi

if [ "${IMPORT_NEW_ARTICLES:-}" = "1" ] || [ "${REINDEX_ARTICLES:-}" = "1" ] || [ "${OVERWRITE_ARTICLES_FROM_JSON:-}" = "1" ]; then
  echo "==> Indeks artykulow Meili"
  docker exec garden-backend node src/scripts/index-articles-simple.js
else
  echo "==> Pomijam indeks artykulow (REINDEX_ARTICLES != 1)"
  echo "    Nowe JSON-y bez nadpisywania: IMPORT_NEW_ARTICLES=1 bash deploy/deploy.sh"
  echo "    Jeden artykul z JSON:         UPDATE_ARTICLE_SLUG=slug bash deploy/deploy.sh"
  echo "    Tylko reindeks:               REINDEX_ARTICLES=1 bash deploy/deploy.sh"
  echo "    Pelny sync z nadpisaniem:     OVERWRITE_ARTICLES_FROM_JSON=1 bash deploy/deploy.sh"
fi

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
