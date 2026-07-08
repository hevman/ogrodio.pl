# Cloudflare + Ogrodio — SSL i DNS

## Architektura

```
Użytkownik ──HTTPS──► Cloudflare (certyfikat edge) ──HTTPS Full Strict──► VPS nginx (Origin Certificate) ──► aplikacja
```

- **Edge SSL:** Cloudflare wystawia certyfikat dla użytkowników (automatycznie).
- **Origin SSL:** certyfikat z Cloudflare Origin CA na VPS (`deploy/ssl/`).
- **Tryb:** **Full (strict)** — Cloudflare weryfikuje certyfikat na serwerze.

Let's Encrypt na origin **nie jest potrzebny**, gdy cały ruch idzie przez Cloudflare z Full (strict).

---

## 1. Cloudflare — dodaj domenę

1. Konto Cloudflare → **Add site** → `ogrodio.pl`
2. Zmień nameservery u registrara na te z Cloudflare
3. Poczekaj na aktywację strefy

---

## 2. DNS (pomarańczowa chmura = proxy ON)

| Typ | Nazwa | Treść | Proxy |
|-----|-------|-------|-------|
| A | `@` | IP VPS | Proxied |
| A | `www` | IP VPS | Proxied |
| A | `sklep` | IP VPS | Proxied |
| A | `app` | IP VPS | Proxied |
| A | `panel` | IP VPS | Proxied |
| A | `api` | IP VPS | Proxied (opcjonalnie) |

**Proxied** = ikona pomarańczowej chmury. Tylko wtedy działa CDN, WAF i edge SSL.

---

## 3. SSL/TLS w Cloudflare

| Ustawienie | Wartość |
|------------|---------|
| **Overview → Encryption mode** | **Full (strict)** |
| **Edge Certificates → Always Use HTTPS** | ON |
| **Automatic HTTPS Rewrites** | ON |
| **Minimum TLS Version** | 1.2 |
| **TLS 1.3** | ON |

### Origin Certificate

1. **SSL/TLS → Origin Server → Create Certificate**
2. Hostnames: `ogrodio.pl`, `*.ogrodio.pl`
3. Key type: RSA (2048) lub ECDSA
4. Skopiuj cert + klucz na VPS:

```bash
# na serwerze
nano /opt/ogrodio/app/deploy/ssl/cloudflare-origin.pem
nano /opt/ogrodio/app/deploy/ssl/cloudflare-origin.key
chmod 600 /opt/ogrodio/app/deploy/ssl/cloudflare-origin.key
bash deploy/verify-ssl.sh
```

---

## 4. Deploy

```bash
cd /opt/ogrodio/app
bash deploy/verify-ssl.sh
bash deploy/deploy.sh
```

Sprawdzenie:

```bash
curl -sI https://ogrodio.pl/health
curl -sI https://sklep.ogrodio.pl/health
```

---

## 5. Cache (porady / artykuły)

Dla treści redakcyjnej zalecane **Page Rules** lub **Cache Rules**:

- `ogrodio.pl/porady/*` → Cache Level: Standard, Edge TTL np. 2h–1d
- `app.ogrodio.pl/*`, `panel.ogrodio.pl/*` → **Bypass** (aplikacja, sesje)
- `/api/*`, `/shop-api` → **Bypass**

W **Caching → Configuration**: Browser Cache TTL według potrzeb.

---

## 6. Bezpieczeństwo (opcjonalnie)

### Tylko ruch z Cloudflare na 80/443

```bash
bash deploy/ufw-cloudflare-only.sh
```

Ogranicza porty 80/443 do IP Cloudflare (SSH pozostaje otwarty).

### Authenticated Origin Pulls

Zaawansowane — Cloudflare wymaga client cert na origin. Nie skonfigurowane domyślnie; Origin Certificate wystarczy dla Full (strict).

---

## 7. Cookies (.ogrodio.pl)

W `.env` produkcyjnym:

```
AUTH_COOKIE_DOMAIN=.ogrodio.pl
AUTH_COOKIE_SECURE=true
```

Działa przez HTTPS Cloudflare → origin Full (strict).

---

## 8. Rozwiązywanie problemów

| Objaw | Przyczyna | Rozwiązanie |
|-------|-----------|-------------|
| Error 525 SSL handshake failed | Brak certu na origin | Origin Certificate + `verify-ssl.sh` |
| Error 526 Invalid SSL certificate | Zły cert / Full strict | Sprawdź PEM i tryb Full (strict) |
| Error 521 Web server down | Stack nie działa | `docker compose ... ps`, logi nginx |
| Pętla przekierowań | Flexible + redirect na origin | Ustaw **Full (strict)**, nie Flexible |
| Złe IP w logach | Brak real_ip | `nginx/includes/cloudflare-real-ip.conf` (już w prod) |

---

## 9. Let's Encrypt (alternatywa)

Jeśli **nie** używasz Cloudflare proxy (DNS only, szara chmura):

```bash
NGINX_CONF=nginx.prod-bootstrap.conf bash deploy/deploy.sh bootstrap
bash deploy/ssl-init.sh
```

Wymaga wtedy zmiany ścieżek SSL w nginx na `/etc/letsencrypt/...` (obecna prod konfiguracja używa Cloudflare Origin).
