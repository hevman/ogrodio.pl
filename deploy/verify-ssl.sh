#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CERT="$ROOT/deploy/ssl/cloudflare-origin.pem"
KEY="$ROOT/deploy/ssl/cloudflare-origin.key"

missing=0

if [ ! -f "$CERT" ]; then
  echo "Brak: deploy/ssl/cloudflare-origin.pem"
  missing=1
fi

if [ ! -f "$KEY" ]; then
  echo "Brak: deploy/ssl/cloudflare-origin.key"
  missing=1
fi

if [ "$missing" -eq 1 ]; then
  echo ""
  echo "Wygeneruj Origin Certificate w Cloudflare (SSL/TLS → Origin Server)."
  echo "Instrukcja: deploy/ssl/README.md"
  exit 1
fi

if ! openssl x509 -in "$CERT" -noout -subject >/dev/null 2>&1; then
  echo "Nieprawidłowy plik PEM: $CERT"
  exit 1
fi

if ! openssl rsa -in "$KEY" -check -noout >/dev/null 2>&1 && \
   ! openssl ec -in "$KEY" -check -noout >/dev/null 2>&1; then
  echo "Nieprawidłowy klucz: $KEY"
  exit 1
fi

EXPIRY="$(openssl x509 -in "$CERT" -noout -enddate | cut -d= -f2)"
echo "OK — certyfikat Cloudflare Origin ważny do: $EXPIRY"
