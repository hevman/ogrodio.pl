#!/usr/bin/env bash
# Klonuje repozytorium do /opt/ogrodio/app (na VPS)
# Uruchom jako root: bash deploy/clone-app.sh

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# shellcheck disable=SC1091
source "$SCRIPT_DIR/repo.env"

INSTALL_DIR="${OGRODIO_INSTALL_DIR:-/opt/ogrodio/app}"
REPO_URL="${OGRODIO_REPO_URL:-https://github.com/hevman/ogrodio.pl.git}"

mkdir -p "$(dirname "$INSTALL_DIR")"

if [ -d "$INSTALL_DIR/.git" ]; then
  echo "Repo już istnieje: $INSTALL_DIR"
  echo "Aktualizacja: cd $INSTALL_DIR && git pull"
  cd "$INSTALL_DIR"
  git pull --ff-only
else
  echo "==> Klonowanie $REPO_URL → $INSTALL_DIR"
  git clone "$REPO_URL" "$INSTALL_DIR"
  cd "$INSTALL_DIR"
fi

chmod +x deploy/*.sh deploy/lib/*.sh 2>/dev/null || true
echo "Gotowe: cd $INSTALL_DIR"
