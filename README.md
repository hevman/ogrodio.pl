# Ogrodio

Platforma ogrodnicza: poradnik ([ogrodio.pl](https://ogrodio.pl)), sklep, aplikacja ogrodnicza i panel administracyjny.

**Repozytorium:** [github.com/hevman/ogrodio.pl](https://github.com/hevman/ogrodio.pl)

## Stack

- **Frontend** — Next.js (strona, sklep, app, panel)
- **Backend** — NestJS (auth, artykuły, aplikacja ogrodu)
- **Commerce** — Vendure (sklep)
- **Search** — Meilisearch
- **Infra** — Docker Compose, nginx, PostgreSQL

## Dev lokalnie

```bash
npm run install:all
docker compose up -d --build
# http://ogrodio.localhost:8080
```

## Produkcja (VPS + Cloudflare)

```bash
git clone https://github.com/hevman/ogrodio.pl.git /opt/ogrodio/app
cd /opt/ogrodio/app
chmod +x deploy/*.sh deploy/lib/*.sh
bash deploy/install-server.sh
# Origin Certificate → deploy/ssl/
bash deploy/post-install.sh
```

Szczegóły: [`deploy/QUICKSTART.md`](deploy/QUICKSTART.md) · [`deploy/DEPLOY.md`](deploy/DEPLOY.md) · [`deploy/CLOUDFLARE.md`](deploy/CLOUDFLARE.md)

### Zdjęcia artykułów (~350 MB)

Katalog `frontend/public/images/articles/` jest **poza git** (za duży). Po deployu na VPS skopiuj go z maszyny dev:

```bash
rsync -avz frontend/public/images/articles/ root@TWOJE_IP:/opt/ogrodio/app/frontend/public/images/articles/
```

Lub użyj backupu z `deploy/backup.sh` na serwerze dev.

## Struktura

```
frontend/     Next.js
backend/      NestJS + artykuły (JSON)
commerce/     Vendure
deploy/       skrypty VPS, firewall, SSL
nginx/        reverse proxy
docker-compose.yml
docker-compose.prod.yml
```
