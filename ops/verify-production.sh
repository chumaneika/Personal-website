#!/bin/sh

set -eu

public_domain=${PUBLIC_DOMAIN:-}
admin_domain=${ADMIN_DOMAIN:-}

if [ -z "$public_domain" ] || [ -z "$admin_domain" ]; then
  echo "PUBLIC_DOMAIN and ADMIN_DOMAIN are required" >&2
  exit 1
fi

case "$public_domain$admin_domain" in
  *[!A-Za-z0-9.-]*)
    echo "Domains contain unsupported characters" >&2
    exit 1
    ;;
esac

if ! command -v curl >/dev/null 2>&1 || ! command -v nc >/dev/null 2>&1; then
  echo "curl and nc are required" >&2
  exit 1
fi

temporary_directory=$(mktemp -d)
cleanup() {
  rm -rf "$temporary_directory"
}
trap cleanup EXIT INT TERM

public_headers="$temporary_directory/public.headers"
admin_headers="$temporary_directory/admin.headers"
sitemap="$temporary_directory/sitemap.xml"
privacy="$temporary_directory/privacy.html"

curl --fail --silent --show-error --location --max-time 20 \
  --dump-header "$public_headers" --output /dev/null "https://${public_domain}/"
curl --fail --silent --show-error --location --max-time 20 \
  --dump-header "$admin_headers" --output /dev/null "https://${admin_domain}/login"
curl --fail --silent --show-error --max-time 20 \
  --output /dev/null "https://${public_domain}/api/health"
curl --fail --silent --show-error --max-time 20 \
  --output "$sitemap" "https://${public_domain}/sitemap.xml"
curl --fail --silent --show-error --max-time 20 \
  --output "$privacy" "https://${public_domain}/privacy"

grep -Eqi '^strict-transport-security:' "$public_headers"
grep -Eqi '^content-security-policy:' "$public_headers"
grep -Eqi '^permissions-policy:' "$public_headers"
grep -Eqi '^strict-transport-security:' "$admin_headers"
grep -Eqi '^content-security-policy:' "$admin_headers"
grep -Eqi '^permissions-policy:' "$admin_headers"
grep -Eqi '^x-robots-tag:.*noindex' "$admin_headers"
grep -q '<urlset' "$sitemap"
grep -q 'Contact form privacy notice' "$privacy"

if nc -z -w 5 "$public_domain" 5432 >/dev/null 2>&1; then
  echo "PostgreSQL port 5432 is reachable from this external host" >&2
  exit 1
fi

echo "Production HTTPS, security headers, public content, and closed PostgreSQL port verified"
