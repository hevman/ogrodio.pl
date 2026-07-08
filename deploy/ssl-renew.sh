#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

docker run --rm \
  -v "${COMPOSE_PROJECT_NAME:-ogrodio}_certbot_etc:/etc/letsencrypt" \
  -v "${COMPOSE_PROJECT_NAME:-ogrodio}_certbot_www:/var/www/certbot" \
  certbot/certbot renew --webroot -w /var/www/certbot --quiet

docker compose -f docker-compose.yml -f docker-compose.prod.yml exec nginx nginx -s reload 2>/dev/null \
  || docker compose -f docker-compose.yml -f docker-compose.prod.yml restart nginx
