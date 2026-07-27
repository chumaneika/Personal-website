#!/bin/sh

set -eu

backup_directory=${POSTGRES_BACKUP_PATH:-/backups}
retention_days=${POSTGRES_BACKUP_RETENTION_DAYS:-14}

case "${PGDATABASE:-}" in
  ""|*[!A-Za-z0-9_.-]*)
    echo "PGDATABASE must contain only letters, numbers, dots, underscores, and hyphens" >&2
    exit 1
    ;;
esac

case "$retention_days" in
  ""|*[!0-9]*)
    echo "POSTGRES_BACKUP_RETENTION_DAYS must be a non-negative integer" >&2
    exit 1
    ;;
esac

mkdir -p "$backup_directory"
umask 077

timestamp=$(date -u "+%Y%m%dT%H%M%SZ")
archive_name="${PGDATABASE}_${timestamp}.dump"
archive_path="${backup_directory}/${archive_name}"
temporary_path="${archive_path}.tmp"

cleanup() {
  rm -f "$temporary_path"
}
trap cleanup EXIT INT TERM

if ! pg_isready --quiet --timeout=10; then
  echo "PostgreSQL is not ready; backup was not created" >&2
  exit 1
fi

echo "Creating PostgreSQL backup ${archive_name}"
pg_dump \
  --format=custom \
  --compress=9 \
  --no-owner \
  --no-privileges \
  --file="$temporary_path"

pg_restore --list "$temporary_path" >/dev/null
mv "$temporary_path" "$archive_path"

(
  cd "$backup_directory"
  sha256sum "$archive_name" >"${archive_name}.sha256"
)

find "$backup_directory" \
  -type f \
  \( -name "${PGDATABASE}_*.dump" -o -name "${PGDATABASE}_*.dump.sha256" \) \
  -mtime "+${retention_days}" \
  -delete

echo "PostgreSQL backup completed: ${archive_path}"
