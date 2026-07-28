#!/bin/sh

set -eu

template_path=/etc/prometheus/prometheus.yml.tmpl
rendered_path=/tmp/prometheus.yml

: "${PUBLIC_SITE_PROBE_URL:?PUBLIC_SITE_PROBE_URL is required}"
: "${ADMIN_SITE_PROBE_URL:?ADMIN_SITE_PROBE_URL is required}"
: "${OBSERVABILITY_ENVIRONMENT:?OBSERVABILITY_ENVIRONMENT is required}"

validate_http_url() {
  variable_name=$1
  variable_value=$2

  case "$variable_value" in
    http://*|https://*)
      ;;
    *)
      echo "${variable_name} must start with http:// or https://" >&2
      exit 1
      ;;
  esac

  if ! printf '%s' "$variable_value" \
    | grep -Eq '^https?://[A-Za-z0-9:/?._~%+@=&,;-]+$'; then
    echo "${variable_name} contains an unsupported URL character" >&2
    exit 1
  fi
}

escape_sed_replacement() {
  printf '%s' "$1" | sed 's/[&|\\]/\\&/g'
}

validate_http_url PUBLIC_SITE_PROBE_URL "$PUBLIC_SITE_PROBE_URL"
validate_http_url ADMIN_SITE_PROBE_URL "$ADMIN_SITE_PROBE_URL"

case "$OBSERVABILITY_ENVIRONMENT" in
  ""|*[!A-Za-z0-9_.-]*)
    echo "OBSERVABILITY_ENVIRONMENT may contain only letters, numbers, dots, underscores, and hyphens" >&2
    exit 1
    ;;
esac

public_site_probe_url=$(escape_sed_replacement "$PUBLIC_SITE_PROBE_URL")
admin_site_probe_url=$(escape_sed_replacement "$ADMIN_SITE_PROBE_URL")
observability_environment=$(escape_sed_replacement "$OBSERVABILITY_ENVIRONMENT")

umask 077
sed \
  -e "s|__PUBLIC_SITE_PROBE_URL__|${public_site_probe_url}|g" \
  -e "s|__ADMIN_SITE_PROBE_URL__|${admin_site_probe_url}|g" \
  -e "s|__OBSERVABILITY_ENVIRONMENT__|${observability_environment}|g" \
  "$template_path" >"$rendered_path"

if [ "${PROMETHEUS_VALIDATE_ONLY:-false}" = "true" ]; then
  exec /bin/promtool check config "$rendered_path"
fi

exec /bin/prometheus --config.file="$rendered_path" "$@"
