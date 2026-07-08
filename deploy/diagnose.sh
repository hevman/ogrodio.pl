#!/usr/bin/env bash
# Pelna diagnostyka produkcyjnego stacku Ogrodio.
# Nie zmienia danych, nie uruchamia importow i nie restartuje kontenerow.

set -u

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT" || exit 1

COMPOSE="docker compose -f docker-compose.yml -f docker-compose.prod.yml"

if [ -f .env ]; then
  # shellcheck disable=SC1091
  source "$(dirname "$0")/lib/load-env.sh"
  fix_env_file .env
  load_env_file .env
fi

export COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-ogrodio}"

section() {
  printf '\n===== %s =====\n' "$1"
}

run() {
  echo "\$ $*"
  "$@" 2>&1 || true
}

http_head() {
  local url="$1"
  echo "--- $url"
  curl -kIL --max-time 15 "$url" 2>&1 || true
}

section "Host"
run hostname
run date -Is
run uptime
run free -h
run df -h / /opt/ogrodio

section "Git"
run git rev-parse --abbrev-ref HEAD
run git log -1 --oneline
run git status --short

section "Docker compose"
run $COMPOSE ps

section "Docker containers"
run docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

section "Nginx config"
run docker exec garden-nginx nginx -t
run docker inspect garden-nginx --format '{{range .Config.Env}}{{println .}}{{end}}'

section "DNS local resolver"
for host in ogrodio.pl sklep.ogrodio.pl app.ogrodio.pl panel.ogrodio.pl api.ogrodio.pl www.sklep.ogrodio.pl; do
  echo "--- $host"
  getent hosts "$host" || true
done

section "HTTP public"
http_head "https://ogrodio.pl/health"
http_head "https://ogrodio.pl/"
http_head "https://sklep.ogrodio.pl/"
http_head "https://app.ogrodio.pl/login"
http_head "https://panel.ogrodio.pl/"
http_head "https://api.ogrodio.pl/health"
http_head "https://www.sklep.ogrodio.pl/"

section "HTTP local origin"
http_head "http://127.0.0.1/health"
http_head "http://127.0.0.1:8080/health"

section "Recent nginx logs"
run docker logs --tail=160 garden-nginx

section "Recent frontend logs"
run docker logs --tail=120 garden-frontend

section "Recent backend logs"
run docker logs --tail=160 garden-backend

section "Recent commerce-server logs"
run docker logs --tail=120 garden-commerce-server

section "Recent commerce-worker logs"
run docker logs --tail=80 garden-commerce-worker

section "Recent postgres logs"
run docker logs --tail=80 garden-backend-postgres
run docker logs --tail=80 garden-commerce-postgres

section "Meilisearch"
run docker logs --tail=80 garden-meilisearch

section "UFW"
run sudo ufw status verbose

section "Done"
echo "Diagnostyka zakonczona."
