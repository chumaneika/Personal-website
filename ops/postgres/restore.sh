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

flyway_history_exists=$(
  psql \
    --no-psqlrc \
    --tuples-only \
    --no-align \
    --set ON_ERROR_STOP=1 \
    --command "SELECT to_regclass('public.flyway_schema_history') IS NOT NULL"
)

if [ "$flyway_history_exists" != "t" ]; then
  echo "Restored database does not contain Flyway schema history" >&2
  exit 1
fi

failed_migrations=$(
  psql \
    --no-psqlrc \
    --tuples-only \
    --no-align \
    --set ON_ERROR_STOP=1 \
    --command "SELECT COUNT(*) FROM public.flyway_schema_history WHERE success = FALSE"
)

if [ "$failed_migrations" != "0" ]; then
  echo "Restored Flyway schema history contains failed migrations" >&2
  exit 1
fi

psql \
  --no-psqlrc \
  --set ON_ERROR_STOP=1 \
  --command "ANALYZE"

echo "PostgreSQL restore completed from ${archive_path}"
