#!/usr/bin/env bash
# Wystawienie certyfikatów Let's Encrypt (SAN: wszystkie subdomeny)
# Wymaga: stack na nginx.prod-bootstrap.conf, DNS wskazujące na VPS

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

if [ ! -f .env ]; then
  echo "Brak pliku .env — skopiuj z .env.production.example"
  exit 1
fi

# shellcheck disable=SC1091
source "$SCRIPT_DIR/lib/load-env.sh"
fix_env_file .env
load_env_file .env

EMAIL="${CERTBOT_EMAIL:-kontakt@ogrodio.pl}"
DOMAIN="${CERTBOT_DOMAIN:-ogrodio.pl}"

DOMAINS=(
  "-d" "$DOMAIN"
  "-d" "www.$DOMAIN"
  "-d" "sklep.$DOMAIN"
  "-d" "app.$DOMAIN"
  "-d" "panel.$DOMAIN"
  "-d" "api.$DOMAIN"
)

PROJECT="${COMPOSE_PROJECT_NAME:-ogrodio}"

echo "==> Certbot (webroot)"
docker run --rm \
  -v "${PROJECT}_certbot_etc:/etc/letsencrypt" \
  -v "${PROJECT}_certbot_www:/var/www/certbot" \
  certbot/certbot certonly \
  --webroot -w /var/www/certbot \
  --email "$EMAIL" \
  --agree-tos --no-eff-email \
  --non-interactive \
  "${DOMAINS[@]}"

echo "==> Przełączenie nginx na HTTPS"
# Upewnij się, że prod compose montuje nginx.prod.conf (domyślnie tak jest)
docker compose -f docker-compose.yml -f docker-compose.prod.yml up -d nginx

echo ""
echo "Certyfikaty w volume ${PROJECT}_certbot_etc."
echo "Odnowienie (cron co 12h): bash deploy/ssl-renew.sh"
