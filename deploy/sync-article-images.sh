#!/usr/bin/env bash
# Wgranie zdjęć artykułów na VPS
#   bash deploy/sync-article-images.sh
#   bash deploy/sync-article-images.sh debian@51.83.162.34

set -euo pipefail

REMOTE="${1:-debian@51.83.162.34}"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOCAL="$ROOT/frontend/public/images/articles"
REMOTE_DIR="/opt/ogrodio/app/frontend/public/images/articles"

if [ ! -d "$LOCAL" ]; then
  echo "Brak katalogu: $LOCAL" >&2
  exit 1
fi

count="$(find "$LOCAL" -maxdepth 1 -type f ! -name '.gitkeep' | wc -l)"
echo "Lokalnie: $LOCAL ($count plików)"
echo "Cel: ${REMOTE}:${REMOTE_DIR}"
echo ""

ssh "$REMOTE" "mkdir -p '$REMOTE_DIR'"
rsync -avz --progress "$LOCAL/" "${REMOTE}:${REMOTE_DIR}/"

echo ""
echo "Gotowe. Test:"
echo "  curl -sI https://ogrodio.pl/images/articles/wiosenne-prace-ogrod.webp"
