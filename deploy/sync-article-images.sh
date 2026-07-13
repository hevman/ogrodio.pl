#!/usr/bin/env bash
# Wgranie obrazow WebP artykulow na VPS przez rsync.
#
#   bash deploy/sync-article-images.sh
#   bash deploy/sync-article-images.sh --remote debian@51.83.162.34
#   bash deploy/sync-article-images.sh --only obraz.webp --only drugi-obraz.webp

set -euo pipefail

REMOTE="debian@51.83.162.34"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
LOCAL="$ROOT/frontend/public/images/articles"
REMOTE_DIR="/opt/ogrodio/app/frontend/public/images/articles"
FILES=()

while [ "$#" -gt 0 ]; do
  case "$1" in
    --remote)
      REMOTE="$2"
      shift 2
      ;;
    --only)
      FILES+=("$2")
      shift 2
      ;;
    *)
      echo "Nieznany parametr: $1" >&2
      exit 1
      ;;
  esac
done

if [ ! -d "$LOCAL" ]; then
  echo "Brak katalogu: $LOCAL" >&2
  exit 1
fi

echo "Cel: ${REMOTE}:${REMOTE_DIR}"
ssh "$REMOTE" "mkdir -p '$REMOTE_DIR'"

if [ "${#FILES[@]}" -gt 0 ]; then
  for file in "${FILES[@]}"; do
    if [[ "$file" == */* ]] || [[ "$file" != *.webp ]] || [ ! -f "$LOCAL/$file" ]; then
      echo "Nieprawidlowy lub brakujacy plik WebP: $file" >&2
      exit 1
    fi
  done

  echo "Tryb: tylko wskazane pliki (${#FILES[@]})"
  rsync -avz --progress "${FILES[@]/#/$LOCAL/}" "${REMOTE}:${REMOTE_DIR}/"
else
  count="$(find "$LOCAL" -maxdepth 1 -type f -name '*.webp' | wc -l)"
  echo "Tryb: wszystkie WebP (tylko nowe/zmienione, lokalnie: $count)"
  rsync -avz --progress --include='*.webp' --exclude='*' "$LOCAL/" "${REMOTE}:${REMOTE_DIR}/"
fi

echo "Gotowe."
