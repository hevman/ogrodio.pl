# Wdrożenie Ogrodio na nowy VPS

Repozytorium: **[github.com/hevman/ogrodio.pl](https://github.com/hevman/ogrodio.pl)**  
VPS: **51.83.162.34** — szczegóły: [SERVER.md](SERVER.md)

## Jedna komenda — przygotowanie serwera (root)

```bash
ssh root@TWOJE_IP
git clone https://github.com/hevman/ogrodio.pl.git /opt/ogrodio/app
cd /opt/ogrodio/app
chmod +x deploy/*.sh deploy/lib/*.sh
bash deploy/install-server.sh
```

**Co robi `install-server.sh`:**

| Element | Opis |
|---------|------|
| **UFW** | deny incoming; SSH; 80/443 **tylko z IP Cloudflare** |
| **Fail2ban** | blokada po 4 nieudanych logowaniach SSH |
| **Docker** | Engine + Compose, limity logów (max 30 MB/kontener) |
| **Swap** | 2 GB |
| **Sysctl** | hardening TCP/IP |
| **SSH** | MaxAuthTries 4, bez pustych haseł |
| **Unattended-upgrades** | łatki bezpieczeństwa |
| **Systemd timers** | backup 03:00, odświeżanie IP CF co miesiąc |
| **Logrotate** | `/var/log/ogrodio/` |

Bez Cloudflare proxy (szara chmura):

```bash
CLOUDFLARE_UFW=false bash deploy/install-server.sh
```

---

## Deploy aplikacji

```bash
cd /opt/ogrodio/app

# 1. Cloudflare Origin Certificate → deploy/ssl/
#    (patrz deploy/CLOUDFLARE.md)

# 2. Post-install (generuje sekrety, build, start)
bash deploy/post-install.sh
```

---

## Codzienna obsługa

```bash
bash deploy/status.sh      # stan serwera i kontenerów
bash deploy/deploy.sh      # aktualizacja (rebuild)
bash deploy/restart.sh     # szybki restart
bash deploy/backup.sh      # ręczny backup
```

---

## Struktura `deploy/`

```
install-server.sh      ← konfiguracja VPS (raz)
clone-app.sh           ← git clone / pull
repo.env               ← URL repozytorium
post-install.sh        ← pierwszy deploy aplikacji
deploy.sh              ← kolejne aktualizacje
lib/ufw-setup.sh       ← reguły firewall
server/                ← szablony sysctl, fail2ban, systemd, docker
CLOUDFLARE.md          ← DNS + SSL
DEPLOY.md              ← pełna dokumentacja
```
