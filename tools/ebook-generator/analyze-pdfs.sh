#!/usr/bin/env sh
set -eu

dir="${1:-/app/ebooks/borowki-w-ogrodzie/data}"

apt-get update >/dev/null
apt-get install -y poppler-utils >/dev/null

for file in "$dir"/*.pdf; do
  name="$(basename "$file")"
  echo "### $name"
  pdfinfo "$file" 2>/dev/null | head -20 || true
  pdftotext -f 1 -l 2 -layout "$file" - 2>/dev/null | head -80 || true
  echo
done
