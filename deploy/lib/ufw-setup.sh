#!/usr/bin/env bash
# Konfiguracja UFW — wywoływane z install-server.sh i ufw-cloudflare-only.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CLOUDFLARE_UFW="${CLOUDFLARE_UFW:-true}"
SSH_PORT="${SSH_PORT:-22}"

if [ "$(id -u)" -ne 0 ]; then
  echo "Wymagany root"
  exit 1
fi

ufw --force reset
ufw default deny incoming
ufw default allow outgoing

ufw allow "${SSH_PORT}/tcp" comment 'SSH'

if [ "$CLOUDFLARE_UFW" = "true" ]; then
  echo "UFW: HTTP/HTTPS tylko z Cloudflare"
  while IFS= read -r ip; do
    [ -z "$ip" ] && continue
    ufw allow from "$ip" to any port 80 proto tcp comment 'CF-v4'
    ufw allow from "$ip" to any port 443 proto tcp comment 'CF-v4'
  done < <(curl -fsSL --retry 3 https://www.cloudflare.com/ips-v4)

  while IFS= read -r ip; do
    [ -z "$ip" ] && continue
    ufw allow from "$ip" to any port 80 proto tcp comment 'CF-v6'
    ufw allow from "$ip" to any port 443 proto tcp comment 'CF-v6'
  done < <(curl -fsSL --retry 3 https://www.cloudflare.com/ips-v6)
else
  echo "UFW: HTTP/HTTPS otwarte publicznie (CLOUDFLARE_UFW=false)"
  ufw allow 80/tcp comment 'HTTP'
  ufw allow 443/tcp comment 'HTTPS'
fi

# Blokuj bezpośredni dostęp do Meilisearch / portów dev (na wszelki wypadek)
ufw deny 7700/tcp comment 'Meilisearch-block' 2>/dev/null || true

ufw --force enable
ufw status verbose
