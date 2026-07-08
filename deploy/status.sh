#!/usr/bin/env bash
# Status stacku i serwera

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

COMPOSE="docker compose -f docker-compose.yml -f docker-compose.prod.yml"

if [ -f .env ]; then
  set -a
  # shellcheck disable=SC1091
  source .env
  set +a
fi
export COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-ogrodio}"

echo "=== Host ==="
echo "  $(hostname) | $(date '+%Y-%m-%d %H:%M %Z')"
echo "  Load: $(uptime | awk -F'load average:' '{print $2}')"
free -h | awk '/Mem:/ {print "  RAM:  "$3" / "$2" używane"}'
free -h | awk '/Swap:/ {print "  Swap: "$3" / "$2}'

echo ""
echo "=== UFW ==="
sudo ufw status 2>/dev/null | head -20 || ufw status | head -20

echo ""
echo "=== Docker ==="
$COMPOSE ps 2>/dev/null || docker compose ps

echo ""
echo "=== Health ==="
for url in "http://127.0.0.1/health" "https://ogrodio.pl/health"; do
  code="$(curl -sko /dev/null -w '%{http_code}' "$url" 2>/dev/null || echo '000')"
  echo "  $url → HTTP $code"
done

echo ""
echo "=== Dysk ==="
df -h / /opt/ogrodio 2>/dev/null | tail -n +2

echo ""
echo "=== Ostatni backup ==="
ls -lt /opt/ogrodio/backups 2>/dev/null | head -3 || echo "  brak"
