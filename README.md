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

### Dodawanie zdjęć do artykułów

Workflow — robisz zdjęcia telefonem, lokalnie konwertujesz i committujesz przez git:

```bash
# 1. Skopiuj zdjęcia z telefonu do frontend/public/images/articles/
#    Nazwa: slug-artykulu-cover.jpg, slug-artykulu-inline.jpg

# 2. Konwertuj JPG → WebP i zaktualizuj JSON artykułów
cd frontend
npm run articles:images
# Skrypt: resize 1800px, quality 82%, EXIF rotation, aktualizuje cover_image/inline_image w JSON

# 3. Commituj i pushuj TYLKO WebP (JPG/PNG ignorowane przez git, zostają lokalnie)
git add frontend/public/images/articles/*.webp backend/content/articles/*.json
git commit -m "feat: dodaj zdjecia do artykulu XYZ"
git push

# 4. Na VPS:
git pull
# Backend fs.watch automatycznie przeładuje artykuły — bez restartu
```

**Ważne:**
- JPG/PNG są w `.gitignore` — oryginały zostają tylko na maszynie dev
- WebP trafia do repo (~150-300 KB każdy) — VPS pobiera przez `git pull`
- Nie ma potrzeby rsync ani ręcznego kopiowania plików na serwer

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
