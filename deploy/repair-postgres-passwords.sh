#!/usr/bin/env bash
# Jednorazowe wyrownanie hasel istniejacych baz PostgreSQL z .env.
# Nie usuwa wolumenow ani danych.

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ ! -f .env ]; then
  echo "Brak .env w $ROOT"
  exit 1
fi

source "$(dirname "$0")/lib/load-env.sh"
load_env_file .env

gen_secret() {
  openssl rand -base64 32 | tr -d '/+=' | head -c 43
}

set_env_value() {
  local key="$1"
  local value="$2"
  if grep -q "^${key}=" .env; then
    sed -i "s|^${key}=.*|${key}=${value}|" .env
  else
    echo "${key}=${value}" >> .env
  fi
}

ensure_secret() {
  local key="$1"
  if [ -z "${!key:-}" ]; then
    local value
    value="$(gen_secret)"
    set_env_value "$key" "$value"
    printf -v "$key" '%s' "$value"
    export "$key"
    echo "Wygenerowano $key"
  fi
}

for key in \
  GARDEN_JWT_SECRET \
  VENDURE_COOKIE_SECRET \
  MEILISEARCH_MASTER_KEY \
  DIGEST_CRON_SECRET \
  BACKEND_POSTGRES_PASSWORD \
  COMMERCE_POSTGRES_PASSWORD; do
  ensure_secret "$key"
done

reset_password() {
  local container="$1"
  local user="$2"
  local database="$3"
  local password="$4"

  if ! docker inspect -f '{{.State.Running}}' "$container" 2>/dev/null | grep -qx true; then
    echo "Kontener $container nie dziala. Uruchom najpierw: docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d"
    exit 1
  fi

  printf 'ALTER ROLE :"role_name" PASSWORD :\047password\047;\n' \
    | docker exec -i "$container" psql -v ON_ERROR_STOP=1 -v role_name="$user" -v password="$password" -U "$user" -d "$database"
}

reset_password \
  garden-backend-postgres \
  "${BACKEND_POSTGRES_USER:-garden}" \
  "${BACKEND_POSTGRES_DB:-garden_backend}" \
  "$BACKEND_POSTGRES_PASSWORD"

reset_password \
  garden-commerce-postgres \
  "${COMMERCE_POSTGRES_USER:-vendure}" \
  "${COMMERCE_POSTGRES_DB:-vendure}" \
  "$COMMERCE_POSTGRES_PASSWORD"

echo "Hasla PostgreSQL sa zgodne z .env. Mozesz uruchomic: bash deploy/deploy.sh"
