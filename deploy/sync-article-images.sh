#!/usr/bin/env bash
# Wgranie zdjęć artykułów na VPS — tylko WebP (~52 MB)
# Oryginały JPG zostają lokalnie (poza git).
#
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

count="$(find "$LOCAL" -maxdepth 1 -type f -name '*.webp' | wc -l)"
size_mb="$(find "$LOCAL" -maxdepth 1 -type f -name '*.webp' -printf '%s\n' 2>/dev/null | awk '{s+=$1} END {printf "%.1f", s/1024/1024}')"
if [ -z "$size_mb" ] || [ "$size_mb" = "0.0" ]; then
  size_mb="$(du -ch "$LOCAL"/*.webp 2>/dev/null | tail -1 | cut -f1)"
fi

echo "Lokalnie: $LOCAL"
echo "WebP: $count plików (~${size_mb} MB), JPG pomijane"
echo "Cel: ${REMOTE}:${REMOTE_DIR}"
echo ""

ssh "$REMOTE" "mkdir -p '$REMOTE_DIR'"
rsync -avz --progress --include='*.webp' --exclude='*' "$LOCAL/" "${REMOTE}:${REMOTE_DIR}/"

echo ""
echo "Gotowe. Test:"
echo "  curl -sI https://ogrodio.pl/images/articles/wiosenne-prace-ogrod.webp"
