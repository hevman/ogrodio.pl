# Ebook Studio

Lokalne narzędzie do budowania e-booków z JSON. Projekt nie jest przeznaczony do publikacji jako strona.

## Struktura

```txt
ebooks/
  nazwa-ebooka/
    ebook.json
    chapters/
      01-rozdzial.json
    images/

tools/
  ebook-generator/
    build.mjs

exports/
  nazwa-ebooka/
    book.html
    book.pdf
    book.epub
```

## Komendy

Podgląd lokalny:

```bash
npm run dev
```

Generowanie jednego e-booka:

```bash
npm run ebook:build -- truskawki-w-ogrodzie
```

Tylko HTML:

```bash
npm run ebook:html -- truskawki-w-ogrodzie
```

Tylko PDF:

```bash
npm run ebook:pdf -- truskawki-w-ogrodzie
```

Tylko EPUB:

```bash
npm run ebook:epub -- truskawki-w-ogrodzie
```

Pliki wynikowe trafiają do `exports/`.

## Docker

Podgląd lokalny w kontenerze:

```bash
docker compose up ebook-studio
```

Jeśli Windows nie rozpoznaje `ebook.localhost`, dopisz w pliku uruchomionym jako administrator:

```txt
C:\Windows\System32\drivers\etc\hosts
```

tę linię:

```txt
127.0.0.1 ebook.localhost
```

Potem otwórz:

```txt
http://ebook.localhost
```

Generowanie pełnego pakietu HTML, PDF i EPUB:

```bash
docker compose run --rm ebook-generator npm run ebook:build -- truskawki-w-ogrodzie
```

Wyniki nadal zapisują się lokalnie do `exports/`.
