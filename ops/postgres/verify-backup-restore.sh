#!/bin/sh

set -eu

backend_image=${BACKUP_RESTORE_BACKEND_IMAGE:-}
postgres_image=${BACKUP_RESTORE_POSTGRES_IMAGE:-postgres:16-alpine}
database_name=personal_website_backup_restore
database_user=backup_restore_user
database_password=backup-restore-password
test_suffix=${GITHUB_RUN_ID:-$$}
resource_prefix="personal-website-backup-restore-${test_suffix}"
network_name="${resource_prefix}-network"
backup_volume="${resource_prefix}-backups"
postgres_container="${resource_prefix}-postgres"
backend_container="${resource_prefix}-backend"

if [ -z "$backend_image" ]; then
  echo "BACKUP_RESTORE_BACKEND_IMAGE is required" >&2
  exit 1
fi

cleanup() {
  docker rm --force "$backend_container" "$postgres_container" >/dev/null 2>&1 || true
  docker volume rm "$backup_volume" >/dev/null 2>&1 || true
  docker network rm "$network_name" >/dev/null 2>&1 || true
}
trap cleanup EXIT INT TERM

wait_for_postgres() {
  attempts=0

  until docker exec "$postgres_container" \
    pg_isready --quiet --username="$database_user" --dbname="$database_name"
  do
    attempts=$((attempts + 1))
    if [ "$attempts" -ge 30 ]; then
      echo "PostgreSQL did not become ready" >&2
      docker logs "$postgres_container" >&2
      exit 1
    fi
    sleep 1
  done
}

start_backend() {
  docker run \
    --detach \
    --name "$backend_container" \
    --network "$network_name" \
    --env "SPRING_DATASOURCE_URL=jdbc:postgresql://${postgres_container}:5432/${database_name}" \
    --env "SPRING_DATASOURCE_USERNAME=${database_user}" \
    --env "SPRING_DATASOURCE_PASSWORD=${database_password}" \
    --env "APP_CORS_ALLOWED_ORIGINS=http://127.0.0.1" \
    --env "APP_ADMIN_INITIALIZER_ENABLED=false" \
    --env "APP_CONTACT_EMAIL_NOTIFICATIONS_ENABLED=false" \
    --env "SENTRY_ENABLED=false" \
    "$backend_image" >/dev/null
}

wait_for_backend() {
  attempts=0

  until docker exec "$backend_container" bash -ec \
    "exec 3<>/dev/tcp/127.0.0.1/8080;
     printf 'GET /actuator/health/readiness HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n' >&3;
     head -n 1 <&3 | grep -q ' 200 '" >/dev/null 2>&1
  do
    attempts=$((attempts + 1))
    if [ "$attempts" -ge 60 ]; then
      echo "Backend did not become ready after database restore" >&2
      docker logs "$backend_container" >&2
      exit 1
    fi
    sleep 1
  done
}

run_postgres_tool() {
  docker run \
    --rm \
    --network "$network_name" \
    --volume "${backup_volume}:/backups" \
    --volume "$(pwd)/ops/postgres:/scripts:ro" \
    --env "PGHOST=${postgres_container}" \
    --env "PGPORT=5432" \
    --env "PGDATABASE=${database_name}" \
    --env "PGUSER=${database_user}" \
    --env "PGPASSWORD=${database_password}" \
    --entrypoint /bin/sh \
    "$postgres_image" \
    "$@"
}

cleanup
docker network create "$network_name" >/dev/null
docker volume create "$backup_volume" >/dev/null

docker run \
  --detach \
  --name "$postgres_container" \
  --network "$network_name" \
  --env "POSTGRES_DB=${database_name}" \
  --env "POSTGRES_USER=${database_user}" \
  --env "POSTGRES_PASSWORD=${database_password}" \
  "$postgres_image" >/dev/null

wait_for_postgres
start_backend
wait_for_backend

docker exec "$postgres_container" \
  psql \
  --username="$database_user" \
  --dbname="$database_name" \
  --set ON_ERROR_STOP=1 \
  --command "CREATE TABLE release_backup_probe (value text NOT NULL);
             INSERT INTO release_backup_probe (value) VALUES ('restored');" >/dev/null

run_postgres_tool /scripts/backup.sh

archive_name=$(
  docker run \
    --rm \
    --volume "${backup_volume}:/backups:ro" \
    --entrypoint /bin/sh \
    "$postgres_image" \
    -ec 'set -- /backups/*.dump; test -f "$1"; basename "$1"'
)

docker exec "$postgres_container" \
  psql \
  --username="$database_user" \
  --dbname="$database_name" \
  --set ON_ERROR_STOP=1 \
  --command "TRUNCATE release_backup_probe" >/dev/null

docker rm --force "$backend_container" >/dev/null
run_postgres_tool /scripts/restore.sh "/backups/${archive_name}"

start_backend
wait_for_backend

restored_value=$(
  docker exec "$postgres_container" \
    psql \
    --username="$database_user" \
    --dbname="$database_name" \
    --tuples-only \
    --no-align \
    --set ON_ERROR_STOP=1 \
    --command "SELECT value FROM release_backup_probe"
)

if [ "$restored_value" != "restored" ]; then
  echo "Backup data was not restored" >&2
  exit 1
fi

applied_migrations=$(
  docker exec "$postgres_container" \
    psql \
    --username="$database_user" \
    --dbname="$database_name" \
    --tuples-only \
    --no-align \
    --set ON_ERROR_STOP=1 \
    --command "SELECT COUNT(*) FROM flyway_schema_history WHERE success = TRUE"
)

case "$applied_migrations" in
  ""|0|*[!0-9]*)
    echo "Restored database has no successful Flyway migrations" >&2
    exit 1
    ;;
esac

if ! docker logs "$backend_container" 2>&1 |
  grep -Eq 'Successfully validated [1-9][0-9]* migrations'; then
  echo "Backend restarted, but Flyway validation was not found in its logs" >&2
  docker logs "$backend_container" >&2
  exit 1
fi

echo "Backup restore verified: backend is ready and Flyway validated ${applied_migrations} migrations"
