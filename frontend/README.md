# Ogrodio - frontend

Next.js + TypeScript dla strony, sklepu i widokow porad.

## Szybka edycja danych

Dane firmy: `src/lib/site-config.ts`

Porady/artykuly: backend NestJS (`/api/articles`) i seed w `backend/content/articles`.

Panel administracyjny: w przygotowaniu (docelowo NestJS). Tymczasowo API staff pod `/panel-api/staff/*`.

## Lokalnie

```powershell
npm install
npm run dev
```

Strona: http://localhost:3000

## Docker

```powershell
docker compose up -d --build
```

Adres: http://ogrodio.localhost/

Jesli Windows nie rozpoznaje domeny, dodaj do `hosts`:

```text
127.0.0.1 ogrodio.localhost
```

## Kontakt

Zapytania: `kontakt@ogrodio.pl` (formularz kontaktowy w przygotowaniu).
