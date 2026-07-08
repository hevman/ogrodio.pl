#!/usr/bin/env bash
# Bezpieczne ładowanie .env (bez bash source — unika błędów przy <> w SMTP_FROM)
load_env_file() {
  local file="${1:-.env}"
  [ -f "$file" ] || return 0

  while IFS= read -r line || [ -n "$line" ]; do
    line="${line%%#*}"
    line="${line%"${line##*[![:space:]]}"}"
    line="${line#"${line%%[![:space:]]*}"}"
    [ -z "$line" ] && continue
    [[ "$line" == *=* ]] || continue

    local key="${line%%=*}"
    local val="${line#*=}"
    key="${key%"${key##*[![:space:]]}"}"
    key="${key#"${key%%[![:space:]]*}"}"

    if [[ "$val" =~ ^\"(.*)\"$ ]]; then
      val="${BASH_REMATCH[1]}"
    elif [[ "$val" =~ ^\'(.*)\'$ ]]; then
      val="${BASH_REMATCH[1]}"
    fi

    printf -v "$key" '%s' "$val"
    export "$key"
  done < "$file"
}

fix_env_file() {
  local file="${1:-.env}"
  [ -f "$file" ] || return 0
  if grep -qE '^SMTP_FROM=Ogrodio <' "$file" 2>/dev/null; then
    sed -i 's/^SMTP_FROM=Ogrodio <noreply@ogrodio.pl>$/SMTP_FROM="Ogrodio <noreply@ogrodio.pl>"/' "$file"
  fi
}
