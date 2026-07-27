#!/bin/sh

set -u

interval_seconds=${POSTGRES_BACKUP_INTERVAL_SECONDS:-86400}
retry_seconds=${POSTGRES_BACKUP_RETRY_SECONDS:-300}

validate_positive_integer() {
  variable_name=$1
  variable_value=$2

  case "$variable_value" in
    ""|*[!0-9]*|0)
      echo "${variable_name} must be a positive integer" >&2
      exit 1
      ;;
  esac
}

validate_positive_integer POSTGRES_BACKUP_INTERVAL_SECONDS "$interval_seconds"
validate_positive_integer POSTGRES_BACKUP_RETRY_SECONDS "$retry_seconds"

trap 'exit 0' INT TERM

while true; do
  if /bin/sh /scripts/backup.sh; then
    delay=$interval_seconds
  else
    echo "Backup failed; retrying in ${retry_seconds} seconds" >&2
    delay=$retry_seconds
  fi

  sleep "$delay" &
  wait $!
done
