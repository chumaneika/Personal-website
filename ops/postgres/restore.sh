#!/bin/sh

set -eu

if [ -n "${POSTGRES_PASSWORD_FILE:-}" ]; then
  if [ ! -r "$POSTGRES_PASSWORD_FILE" ]; then
    echo "PostgreSQL password file is not readable" >&2
    exit 1
  fi

  PGPASSWORD=$(cat "$POSTGRES_PASSWORD_FILE")
  export PGPASSWORD
fi

archive_path=${1:-}

if [ -z "$archive_path" ]; then
  echo "Usage: restore.sh /backups/<archive>.dump" >&2
  exit 1
fi

if [ ! -f "$archive_path" ]; then
  echo "Backup archive not found: ${archive_path}" >&2
  exit 1
fi

case "${PGDATABASE:-}" in
  ""|postgres|template0|template1|*[!A-Za-z0-9_.-]*)
    echo "Refusing to restore an invalid or system database: ${PGDATABASE:-<empty>}" >&2
    exit 1
    ;;
esac

checksum_path="${archive_path}.sha256"
if [ ! -f "$checksum_path" ]; then
  echo "Checksum file not found: ${checksum_path}" >&2
  exit 1
fi

archive_directory=$(dirname "$archive_path")
archive_name=$(basename "$archive_path")
(
  cd "$archive_directory"
  sha256sum -c "${archive_name}.sha256"
)
pg_restore --list "$archive_path" >/dev/null

echo "Recreating PostgreSQL database ${PGDATABASE}"
dropdb \
  --maintenance-db=postgres \
  --force \
  --if-exists \
  "$PGDATABASE"
createdb \
  --maintenance-db=postgres \
  --owner="$PGUSER" \
  "$PGDATABASE"

pg_restore \
  --exit-on-error \
  --single-transaction \
  --no-owner \
  --no-privileges \
  --dbname="$PGDATABASE" \
  "$archive_path"

echo "PostgreSQL restore completed from ${archive_path}"
