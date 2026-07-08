# Ogrodio — wdrożenie na VPS (2 vCPU / 4 GB RAM / 40 GB SSD)

**Szybki start:** [QUICKSTART.md](QUICKSTART.md)  
**Cloudflare:** [CLOUDFLARE.md](CLOUDFLARE.md)

---

## Checklist nowego VPS

```bash
# 1. Serwer (jako root)
git clone https://github.com/hevman/ogrodio.pl.git /opt/ogrodio/app && cd /opt/ogrodio/app
chmod +x deploy/*.sh deploy/lib/*.sh
bash deploy/install-server.sh

# 2. Cloudflare: DNS proxied + Full (strict) + Origin Certificate → deploy/ssl/

# 3. Aplikacja
bash deploy/post-install.sh

# 4. Weryfikacja
bash deploy/status.sh
```

---

## Co jest na serwerze po `install-server.sh`

| Warstwa | Konfiguracja |
|---------|--------------|
| **Firewall** | UFW — domyślnie tylko SSH + HTTP/HTTPS z IP Cloudflare |
| **Fail2ban** | SSH — ban 24h po 4 błędnych hasłach |
| **SSH** | `MaxAuthTries 4`, bez pustych haseł |
| **Docker** | logi max 10 MB × 3 pliki na kontener |
| **Swap** | 2 GB, swappiness=10 |
| **Aktualizacje** | unattended-upgrades (security) |
| **Backup** | timer systemd — codziennie 03:00 → `/opt/ogrodio/backups` |
| **Cloudflare IP** | timer — co miesiąc odświeża reguły UFW |

Szablony: `deploy/server/`

---

## Cloudflare + SSL

1. DNS **A** → IP VPS, **Proxied**
2. SSL/TLS → **Full (strict)**
3. Origin Certificate → `deploy/ssl/cloudflare-origin.pem` + `.key`

Szczegóły: [CLOUDFLARE.md](CLOUDFLARE.md)

---

## Zmienne `install-server.sh`

| Zmienna | Domyślnie | Opis |
|---------|-----------|------|
| `CLOUDFLARE_UFW` | `true` | 80/443 tylko z CF |
| `SSH_PORT` | `22` | port SSH |
| `SWAP_SIZE` | `2G` | rozmiar swap |
| `INSTALL_USER` | — | opcjonalny użytkownik z grupą docker |

---

## `.env` produkcyjny

```bash
cp .env.production.example .env
```

`post-install.sh` **automatycznie generuje** puste sekrety (JWT, hasła DB, Meili). Uzupełnij ręcznie: SMTP, Vendure admin, `VENDURE_ADMIN_TOKEN` po pierwszym starcie.

---

## Operacje

| Komenda | Opis |
|---------|------|
| `bash deploy/post-install.sh` | Pierwszy deploy |
| `bash deploy/deploy.sh` | Rebuild + restart |
| `bash deploy/status.sh` | Health + RAM + UFW |
| `bash deploy/restart.sh` | Restart bez build |
| `bash deploy/backup.sh` | Ręczny backup |
| `bash deploy/ufw-cloudflare-only.sh` | Odśwież IP CF w UFW |

---

## Limity RAM (Docker)

commerce-server 768 MB · frontend 512 MB · meilisearch 512 MB · postgres ×2 384 MB · backend 384 MB · worker 256 MB

---

## Rozwiązywanie problemów

| Problem | Działanie |
|---------|-----------|
| 525/526 SSL | Origin cert + Full (strict) — [CLOUDFLARE.md](CLOUDFLARE.md) |
| Nie mogę wejść na stronę spoza CF | Zamierzone — UFW blokuje bezpośredni IP |
| Test bez CF | `CLOUDFLARE_UFW=false bash deploy/lib/ufw-setup.sh` |
| OOM przy build | swap 2G jest; `docker compose build` w nocy |
| Fail2ban zablokował IP | `fail2ban-client status sshd` / `fail2ban-client unban IP` |

---

## Dev lokalnie

```bash
docker compose up -d          # port 8080, .localhost
npm run docker:prod           # profil prod (wymaga SSL w deploy/ssl/)
```
