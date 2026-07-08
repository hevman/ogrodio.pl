#!/usr/bin/env bash
# Pełna konfiguracja nowego VPS Ubuntu 22.04/24.04 dla Ogrodio
# Uruchom jako root (jednorazowo):
#   curl -fsSL .../install-server.sh | bash
#   lub: bash deploy/install-server.sh
#
# Zmienne (opcjonalnie):
#   CLOUDFLARE_UFW=true     — 80/443 tylko z IP Cloudflare (domyślnie: true)
#   SSH_PORT=22             — port SSH
#   SWAP_SIZE=2G            — rozmiar swap
#   INSTALL_USER=deploy     — użytkownik do deployu (opcjonalny)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SERVER_DIR="$SCRIPT_DIR/server"

CLOUDFLARE_UFW="${CLOUDFLARE_UFW:-true}"
SSH_PORT="${SSH_PORT:-22}"
SWAP_SIZE="${SWAP_SIZE:-2G}"
INSTALL_USER="${INSTALL_USER:-}"

if [ "$(id -u)" -ne 0 ]; then
  echo "Uruchom jako root: sudo bash deploy/install-server.sh"
  exit 1
fi

if [ ! -f /etc/os-release ]; then
  echo "Nieobsługiwany system — wymagany Ubuntu/Debian"
  exit 1
fi

# shellcheck disable=SC1091
source /etc/os-release
if [[ "${ID:-}" != "ubuntu" && "${ID:-}" != "debian" ]]; then
  echo "Ostrzeżenie: testowano na Ubuntu 22.04/24.04, wykryto: ${ID:-unknown}"
fi

export DEBIAN_FRONTEND=noninteractive

log() { echo ""; echo "==> $*"; }

log "Aktualizacja systemu"
apt-get update
apt-get upgrade -y
apt-get install -y \
  ca-certificates curl git gnupg ufw fail2ban htop unzip \
  unattended-upgrades apt-listchanges logrotate openssl

log "Automatyczne aktualizacje bezpieczeństwa"
dpkg-reconfigure -f noninteractive unattended-upgrades 2>/dev/null || true
systemctl enable unattended-upgrades 2>/dev/null || true

log "Strefa czasowa (Europa/Warszawa)"
timedatectl set-timezone Europe/Warsaw 2>/dev/null || true

log "Sysctl — sieć i bezpieczeństwo"
if [ -f "$SERVER_DIR/sysctl/99-ogrodio.conf" ]; then
  cp "$SERVER_DIR/sysctl/99-ogrodio.conf" /etc/sysctl.d/99-ogrodio.conf
  sysctl --system >/dev/null 2>&1 || sysctl -p /etc/sysctl.d/99-ogrodio.conf
fi

log "Swap $SWAP_SIZE"
if [ ! -f /swapfile ]; then
  fallocate -l "$SWAP_SIZE" /swapfile 2>/dev/null || dd if=/dev/zero of=/swapfile bs=1M count=2048 status=progress
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  grep -q '/swapfile' /etc/fstab || echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi
grep -q 'vm.swappiness' /etc/sysctl.conf || echo 'vm.swappiness=10' >> /etc/sysctl.conf
sysctl vm.swappiness=10 2>/dev/null || true

log "Docker Engine + Compose plugin"
if ! command -v docker >/dev/null 2>&1; then
  curl -fsSL https://get.docker.com | sh
fi
systemctl enable docker
systemctl start docker

if [ -f "$SERVER_DIR/docker/daemon.json" ]; then
  mkdir -p /etc/docker
  cp "$SERVER_DIR/docker/daemon.json" /etc/docker/daemon.json
  systemctl restart docker
fi

log "Docker — dostęp użytkownika deploy"
DEPLOY_USER="${INSTALL_USER:-${SUDO_USER:-debian}}"
if id "$DEPLOY_USER" &>/dev/null; then
  usermod -aG docker "$DEPLOY_USER"
  echo "Użytkownik $DEPLOY_USER dodany do grupy docker"
fi

log "Katalogi aplikacji"
mkdir -p /opt/ogrodio/app
mkdir -p /opt/ogrodio/backups
mkdir -p /var/log/ogrodio
chmod 750 /opt/ogrodio/backups

log "Użytkownik deploy (opcjonalny)"
if [ -n "$INSTALL_USER" ] && ! id "$INSTALL_USER" &>/dev/null; then
  useradd -m -s /bin/bash -G docker "$INSTALL_USER"
  mkdir -p "/home/$INSTALL_USER/.ssh"
  if [ -f /root/.ssh/authorized_keys ]; then
    cp /root/.ssh/authorized_keys "/home/$INSTALL_USER/.ssh/"
    chown -R "$INSTALL_USER:$INSTALL_USER" "/home/$INSTALL_USER/.ssh"
    chmod 700 "/home/$INSTALL_USER/.ssh"
    chmod 600 "/home/$INSTALL_USER/.ssh/authorized_keys"
  fi
  chown -R "$INSTALL_USER:$INSTALL_USER" /opt/ogrodio
  echo "Utworzono użytkownika: $INSTALL_USER (grupa docker)"
fi

log "Fail2ban"
if [ -f "$SERVER_DIR/fail2ban/jail.local" ]; then
  cp "$SERVER_DIR/fail2ban/jail.local" /etc/fail2ban/jail.local
fi
systemctl enable fail2ban
systemctl restart fail2ban

log "SSH — podstawowe utwardzenie"
if [ -f "$SERVER_DIR/ssh/sshd_ogrodio.conf" ]; then
  cp "$SERVER_DIR/ssh/sshd_ogrodio.conf" /etc/ssh/sshd_config.d/99-ogrodio.conf
  if [ "$SSH_PORT" != "22" ]; then
    sed -i "s/^# Port 22/Port $SSH_PORT/" /etc/ssh/sshd_config.d/99-ogrodio.conf 2>/dev/null || \
      echo "Port $SSH_PORT" >> /etc/ssh/sshd_config.d/99-ogrodio.conf
  fi
  sshd -t && systemctl reload sshd
fi

log "Firewall UFW"
bash "$SCRIPT_DIR/lib/ufw-setup.sh"

log "Systemd — backup i odświeżanie IP Cloudflare"
if [ -f "$SERVER_DIR/systemd/ogrodio-backup.service" ]; then
  cp "$SERVER_DIR/systemd/ogrodio-backup.service" /etc/systemd/system/
  cp "$SERVER_DIR/systemd/ogrodio-backup.timer" /etc/systemd/system/
  systemctl daemon-reload
  systemctl enable ogrodio-backup.timer
fi
if [ -f "$SERVER_DIR/systemd/ogrodio-cf-ufw.service" ]; then
  cp "$SERVER_DIR/systemd/ogrodio-cf-ufw.service" /etc/systemd/system/
  cp "$SERVER_DIR/systemd/ogrodio-cf-ufw.timer" /etc/systemd/system/
  systemctl daemon-reload
  systemctl enable ogrodio-cf-ufw.timer
fi

log "Logrotate — logi Ogrodio"
if [ -f "$SERVER_DIR/logrotate/ogrodio" ]; then
  cp "$SERVER_DIR/logrotate/ogrodio" /etc/logrotate.d/ogrodio
fi

REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
chmod +x "$REPO_ROOT"/deploy/*.sh "$REPO_ROOT"/deploy/lib/*.sh 2>/dev/null || true

cat <<'EOF'

╔══════════════════════════════════════════════════════════════╗
║  Serwer VPS skonfigurowany                                   ║
╠══════════════════════════════════════════════════════════════╣
║  Firewall:  UFW (SSH + HTTP/HTTPS z Cloudflare)              ║
║  Fail2ban:  SSH                                              ║
║  Docker:    włączony, limity logów                           ║
║  Swap:      2 GB                                             ║
║  Katalogi:  /opt/ogrodio/app, /opt/ogrodio/backups           ║
╠══════════════════════════════════════════════════════════════╣
║  Następne kroki:                                             ║
║  1. git clone https://github.com/hevman/ogrodio.pl.git         ║
║     → /opt/ogrodio/app                                       ║
║  2. cp .env.production.example .env && uzupełnij             ║
║  3. Cloudflare Origin Cert → deploy/ssl/                     ║
║  4. bash deploy/post-install.sh                              ║
╚══════════════════════════════════════════════════════════════╝

EOF
