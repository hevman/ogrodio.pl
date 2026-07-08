#!/usr/bin/env bash
# Odśwież reguły UFW dla IP Cloudflare (cron / systemd timer)

set -euo pipefail

export CLOUDFLARE_UFW=true
exec bash "$(dirname "$0")/lib/ufw-setup.sh"
