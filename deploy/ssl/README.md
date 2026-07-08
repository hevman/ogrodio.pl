# Certyfikat SSL na origin (Cloudflare)

Pliki w tym katalogu montowane są do nginx jako `/etc/nginx/ssl/`.

## Cloudflare Origin Certificate (zalecane)

1. Cloudflare Dashboard → **SSL/TLS** → **Origin Server** → **Create Certificate**
2. Hostnames:
   - `ogrodio.pl`
   - `*.ogrodio.pl`
3. Validity: 15 lat
4. Zapisz na serwerze:

```bash
nano deploy/ssl/cloudflare-origin.pem    # wklej „Origin Certificate”
nano deploy/ssl/cloudflare-origin.key    # wklej „Private Key”
chmod 600 deploy/ssl/cloudflare-origin.key
```

5. Cloudflare → **SSL/TLS** → **Overview** → tryb **Full (strict)**

## Weryfikacja przed deployem

```bash
bash deploy/verify-ssl.sh
```

## Bez Cloudflare?

Użyj Let's Encrypt: `bash deploy/ssl-init.sh` (wymaga zmiany ścieżek certów w nginx lub osobnego pliku konfiguracyjnego).
