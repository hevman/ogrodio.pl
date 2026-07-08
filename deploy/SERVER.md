# VPS Ogrodio — dane serwera

| Parametr | Wartość |
|----------|---------|
| **IPv4** | `51.83.162.34` |
| **IPv6** | `2001:41d0:601:1100::2a53` |
| **Gateway IPv6** | `2001:41d0:601:1100::1` |
| **Repo** | https://github.com/hevman/ogrodio.pl |
| **SSH** | `root@51.83.162.34` (port 22) |

---

## 1. Terminus — połączenie SSH

1. Otwórz **Termius** → **New Host**
2. Ustaw:
   - **Address:** `51.83.162.34`
   - **Username:** `root` (lub użytkownik od hostingu)
   - **Password** lub **Key** (klucz SSH z panelu OVH — zalecane)
3. Zapisz i **Connect**

Pierwsze logowanie (Ubuntu/Debian):

```bash
apt update && apt upgrade -y
```

---

## 2. Domena ogrodio.pl — dwie ścieżki

### A) Zalecane: Cloudflare (CDN + SSL + firewall tylko CF)

**Nie musisz** konfigurować „DNS secondary” w panelu OVH, jeśli domena idzie przez Cloudflare.

1. Załóż konto [Cloudflare](https://dash.cloudflare.com) → **Add site** → `ogrodio.pl`
2. Cloudflare pokaże **2 nameservery** (np. `ada.ns.cloudflare.com`, `bob.ns.cloudflare.com`)
3. W panelu **rejestratora domeny** (OVH / inny) zmień nameservery na te z Cloudflare
4. W Cloudflare → **DNS** → **Records**:

| Typ | Nazwa | Treść | Proxy |
|-----|-------|-------|-------|
| A | `@` | `51.83.162.34` | Proxied (pomarańczowa chmura) |
| A | `www` | `51.83.162.34` | Proxied |
| A | `sklep` | `51.83.162.34` | Proxied |
| A | `app` | `51.83.162.34` | Proxied |
| A | `panel` | `51.83.162.34` | Proxied |
| A | `api` | `51.83.162.34` | Proxied |

Opcjonalnie IPv6 (tylko jeśli nginx nasłuchuje na v6 — na start **wystarczy A / IPv4**):

| Typ | Nazwa | Treść | Proxy |
|-----|-------|-------|-------|
| AAAA | `@` | `2001:41d0:601:1100::2a53` | Proxied |

5. **SSL/TLS** → **Full (strict)**
6. **Origin Server** → Create Certificate (`ogrodio.pl`, `*.ogrodio.pl`) → zapisz na VPS w `deploy/ssl/`

Szczegóły: [CLOUDFLARE.md](CLOUDFLARE.md)

### B) DNS secondary w OVH (bez Cloudflare)

Jeśli domena jest w OVH i chcesz użyć **DNS secondary** VPS:

1. Panel OVH → domena → strefa DNS **lub** delegacja na DNS serwera VPS
2. Dodaj rekordy **A** jak w tabeli powyżej → `51.83.162.34`
3. Wtedy **nie** masz proxy Cloudflare — użyj Let's Encrypt: `bash deploy/ssl-init.sh` zamiast Origin Certificate

Dla produkcji **Cloudflare (A) jest prostsze** — pasuje do `install-server.sh` (UFW tylko z IP Cloudflare).

---

## 3. Deploy na serwerze (w Terminus)

Po połączeniu SSH:

```bash
git clone https://github.com/hevman/ogrodio.pl.git /opt/ogrodio/app
cd /opt/ogrodio/app
chmod +x deploy/*.sh deploy/lib/*.sh

# Konfiguracja VPS: firewall, Docker, fail2ban, swap
bash deploy/install-server.sh

# Certyfikaty Cloudflare Origin (wklej z panelu CF):
nano deploy/ssl/cloudflare-origin.pem
nano deploy/ssl/cloudflare-origin.key
chmod 600 deploy/ssl/cloudflare-origin.key
bash deploy/verify-ssl.sh

# Deploy aplikacji (generuje .env, build, start)
bash deploy/post-install.sh
```

Z Windows (zdjęcia artykułów ~350 MB — poza git):

```powershell
# scp/rsync z maszyny dev — w Termius można SFTP
scp -r D:\www_work\garden\frontend\public\images\articles root@51.83.162.34:/opt/ogrodio/app/frontend/public/images/articles/
```

---

## 4. Sprawdzenie

```bash
bash deploy/status.sh
curl -sI https://ogrodio.pl/health
```

W przeglądarce (po propagacji DNS, zwykle 5–30 min):

- https://ogrodio.pl
- https://sklep.ogrodio.pl
- https://app.ogrodio.pl

---

## 5. „Brak skonfigurowanych domen” w panelu OVH

To pole **DNS secondary VPS** — opcjonalne. Przy Cloudflare:

- Domena wskazuje nameservery **Cloudflare**, nie VPS
- Rekordy A ustawiasz w **Cloudflare DNS**, nie w OVH secondary
- Możesz **pominąć** dodawanie domeny w DNS secondary OVH

Jeśli domena `ogrodio.pl` jest u **innego rejestratora** niż OVH — i tak zmieniasz tylko nameservery na Cloudflare.

---

## 6. Kolejność (checklist)

- [ ] SSH działa w Termius (`root@51.83.162.34`)
- [ ] Cloudflare: nameservery u rejestratora
- [ ] Cloudflare DNS: A → `51.83.162.34`, Proxied
- [ ] Cloudflare SSL: Full (strict) + Origin Certificate na VPS
- [ ] `bash deploy/install-server.sh`
- [ ] `bash deploy/post-install.sh`
- [ ] rsync zdjęć artykułów
- [ ] `https://ogrodio.pl/health` → `healthy`
