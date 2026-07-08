#!/usr/bin/env bash
# Pierwszy deploy aplikacji po install-server.sh
# Uruchom z katalogu repo: bash deploy/post-install.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m'

fail() { echo -e "${RED}✗ $*${NC}" >&2; exit 1; }
ok()   { echo -e "${GREEN}✓ $*${NC}"; }

echo "==> Ogrodio post-install"
echo "    Katalog: $ROOT"

# ─── .env ───────────────────────────────────────────────────────────────────
if [ ! -f .env ]; then
  if [ -f .env.production.example ]; then
    cp .env.production.example .env
    echo "Utworzono .env z szablonu — UZUPEŁNIJ SEKRETY przed produkcją!"
  else
    fail "Brak .env i .env.production.example"
  fi
fi

# Wygeneruj brakujące sekrety jeśli puste
gen_secret() { openssl rand -base64 32 | tr -d '/+=' | head -c 43; }

# shellcheck disable=SC1091
source "$(dirname "$0")/lib/load-env.sh"
fix_env_file .env
load_env_file .env

if [ -z "${GARDEN_JWT_SECRET:-}" ]; then
  GARDEN_JWT_SECRET="$(gen_secret)"
  echo "GARDEN_JWT_SECRET=${GARDEN_JWT_SECRET}" >> .env
  ok "Wygenerowano GARDEN_JWT_SECRET"
fi
if [ -z "${VENDURE_COOKIE_SECRET:-}" ]; then
  VENDURE_COOKIE_SECRET="$(gen_secret)"
  echo "VENDURE_COOKIE_SECRET=${VENDURE_COOKIE_SECRET}" >> .env
  ok "Wygenerowano VENDURE_COOKIE_SECRET"
fi
if [ -z "${MEILISEARCH_MASTER_KEY:-}" ]; then
  MEILISEARCH_MASTER_KEY="$(gen_secret)"
  echo "MEILISEARCH_MASTER_KEY=${MEILISEARCH_MASTER_KEY}" >> .env
  ok "Wygenerowano MEILISEARCH_MASTER_KEY"
fi
if [ -z "${DIGEST_CRON_SECRET:-}" ]; then
  DIGEST_CRON_SECRET="$(gen_secret)"
  echo "DIGEST_CRON_SECRET=${DIGEST_CRON_SECRET}" >> .env
  ok "Wygenerowano DIGEST_CRON_SECRET"
fi
if [ -z "${BACKEND_POSTGRES_PASSWORD:-}" ]; then
  BACKEND_POSTGRES_PASSWORD="$(gen_secret)"
  echo "BACKEND_POSTGRES_PASSWORD=${BACKEND_POSTGRES_PASSWORD}" >> .env
  ok "Wygenerowano BACKEND_POSTGRES_PASSWORD"
fi
if [ -z "${COMMERCE_POSTGRES_PASSWORD:-}" ]; then
  COMMERCE_POSTGRES_PASSWORD="$(gen_secret)"
  echo "COMMERCE_POSTGRES_PASSWORD=${COMMERCE_POSTGRES_PASSWORD}" >> .env
  ok "Wygenerowano COMMERCE_POSTGRES_PASSWORD"
fi
if [ -z "${VENDURE_SUPERADMIN_USERNAME:-}" ]; then
  VENDURE_SUPERADMIN_USERNAME="ogrodio-admin"
  if grep -q '^VENDURE_SUPERADMIN_USERNAME=' .env; then
    sed -i "s/^VENDURE_SUPERADMIN_USERNAME=.*/VENDURE_SUPERADMIN_USERNAME=${VENDURE_SUPERADMIN_USERNAME}/" .env
  else
    echo "VENDURE_SUPERADMIN_USERNAME=${VENDURE_SUPERADMIN_USERNAME}" >> .env
  fi
  ok "Ustawiono VENDURE_SUPERADMIN_USERNAME=ogrodio-admin"
fi
if [ -z "${VENDURE_SUPERADMIN_PASSWORD:-}" ]; then
  VENDURE_SUPERADMIN_PASSWORD="$(gen_secret)"
  if grep -q '^VENDURE_SUPERADMIN_PASSWORD=' .env; then
    sed -i "s/^VENDURE_SUPERADMIN_PASSWORD=.*/VENDURE_SUPERADMIN_PASSWORD=${VENDURE_SUPERADMIN_PASSWORD}/" .env
  else
    echo "VENDURE_SUPERADMIN_PASSWORD=${VENDURE_SUPERADMIN_PASSWORD}" >> .env
  fi
  ok "Wygenerowano VENDURE_SUPERADMIN_PASSWORD (zapisane w .env)"
fi

load_env_file .env

# ─── SSL ────────────────────────────────────────────────────────────────────
SSL_OK=0
bash deploy/verify-ssl.sh 2>/dev/null && SSL_OK=1 || true

if [ "$SSL_OK" -eq 0 ]; then
  echo ""
  echo "Brak certyfikatu Cloudflare Origin w deploy/ssl/"
  echo "  Cloudflare → SSL/TLS → Origin Server → Create Certificate"
  echo "  Zapisz: deploy/ssl/cloudflare-origin.pem + cloudflare-origin.key"
  echo ""
  if [ "${SKIP_SSL_PROMPT:-}" = "1" ]; then
    fail "Brak SSL — ustaw certyfikaty lub SKIP_SSL_PROMPT=0"
  fi
  read -r -p "Kontynuować deploy HTTP (bootstrap)? [y/N] " ans
  if [[ ! "$ans" =~ ^[yY]$ ]]; then
    exit 1
  fi
  export NGINX_CONF=nginx.prod-bootstrap.conf
  export SKIP_SSL_VERIFY=1
fi

# ─── Systemd (backup + odświeżanie IP CF) ───────────────────────────────────
install_systemd_unit() {
  local unit="$1"
  if [ -f "deploy/server/systemd/$unit" ] && [ -d /etc/systemd/system ]; then
    sed "s|/opt/ogrodio/app|$ROOT|g" "deploy/server/systemd/$unit" \
      | sudo tee "/etc/systemd/system/$unit" >/dev/null
  fi
}

if [ -d /etc/systemd/system ]; then
  for unit in ogrodio-backup.service ogrodio-backup.timer ogrodio-cf-ufw.service ogrodio-cf-ufw.timer; do
    install_systemd_unit "$unit"
  done
  sudo systemctl daemon-reload
  sudo systemctl enable ogrodio-backup.timer ogrodio-cf-ufw.timer 2>/dev/null || true
  sudo systemctl start ogrodio-backup.timer ogrodio-cf-ufw.timer 2>/dev/null || true
  ok "Timery systemd: backup 03:00, odświeżanie IP CF co miesiąc"
fi

# ─── Deploy ───────────────────────────────────────────────────────────────────
bash deploy/deploy.sh

echo ""
ok "Post-install zakończony"
echo "  Sprawdź: curl -sI https://ogrodio.pl/health"
echo "  Status:  bash deploy/status.sh"
