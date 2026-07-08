#!/usr/bin/env bash
# Lokalna kopia zapasowa (uzupełnia backup VPS od hostingu)
# Cron: 0 3 * * * /opt/ogrodio/app/deploy/backup.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

BACKUP_DIR="${BACKUP_DIR:-/opt/ogrodio/backups}"
STAMP="$(date +%Y%m%d-%H%M%S)"
DEST="$BACKUP_DIR/$STAMP"
mkdir -p "$DEST"

# shellcheck disable=SC1091
source "$(dirname "$0")/lib/load-env.sh"
if [ -f .env ]; then
  fix_env_file .env
  load_env_file .env
fi
export COMPOSE_PROJECT_NAME="${COMPOSE_PROJECT_NAME:-ogrodio}"

echo "==> Dump PostgreSQL (backend)"
docker exec garden-backend-postgres pg_dump -U "${BACKEND_POSTGRES_USER:-garden}" "${BACKEND_POSTGRES_DB:-garden_backend}" \
  | gzip > "$DEST/backend-postgres.sql.gz"

echo "==> Dump PostgreSQL (commerce)"
docker exec garden-commerce-postgres pg_dump -U "${COMMERCE_POSTGRES_USER:-vendure}" "${COMMERCE_POSTGRES_DB:-vendure}" \
  | gzip > "$DEST/commerce-postgres.sql.gz"

echo "==> Meilisearch volume"
docker run --rm \
  -v "${COMPOSE_PROJECT_NAME:-ogrodio}_meilisearch_data:/data:ro" \
  -v "$DEST":/backup \
  alpine tar czf /backup/meilisearch-data.tar.gz -C /data .

echo "==> Zdjęcia artykułów + uploady"
tar czf "$DEST/media.tar.gz" \
  -C "$ROOT" frontend/public/images/articles data/uploads 2>/dev/null || true

echo "==> Retencja 14 dni"
find "$BACKUP_DIR" -maxdepth 1 -type d -mtime +14 -exec rm -rf {} +

echo "Backup: $DEST"
