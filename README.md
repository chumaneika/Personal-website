# Personal Website

Monorepo with two frontend applications:

- `frontend-public` - public-facing website
- `frontend-admin` - admin interface

Both frontends use React, TypeScript, Vite, React Router, SCSS, Axios, TanStack Query, React Hook Form, and Zod.

The backend uses Java 17, Spring Boot, Spring Security, Spring Data JPA, and PostgreSQL.

## Admin authentication

The admin application uses a server-side session:

- credentials are sent only to `POST /api/auth/login`;
- the session identifier is stored in an HttpOnly cookie;
- unsafe requests require a CSRF token obtained from `GET /api/auth/csrf`;
- sign-in attempts are rate limited by client address;
- logout invalidates the session;
- password changes invalidate the current session.

Neither the password nor an authorization header is stored in browser storage.

## Scripts

```bash
npm install
npm run dev:public
npm run dev:admin
npm run build
```

The public frontend runs on `http://localhost:5173`.
The admin frontend runs on `http://localhost:5174`.

## Frontend quality

Both frontend workspaces share the same quality gate:

```bash
npm run quality
```

It checks Prettier formatting, runs ESLint with zero allowed warnings, type-checks
both TypeScript applications, executes the Vitest projects, and creates
production builds. Useful individual commands are:

```bash
npm run format
npm run format:check
npm run lint
npm run lint:fix
npm run typecheck
npm run test
npm run test:watch
```

The frontend CI job runs `npm run quality` for every pull request and push to
`main`.

Run the backend with Java 17:

```bash
cd springboot
./mvnw spring-boot:run
```

Copy `.env.example` to `.env` before starting the backend or Docker Compose.

## Database migrations

Flyway owns the database schema. The initial migration is
`springboot/src/main/resources/db/migration/V1__initial_schema.sql`, and
`V2__add_constraints_and_indexes.sql` hardens both fresh and baselined existing
databases. Hibernate runs with `ddl-auto=validate`.

Add every later schema change as a new immutable migration:

```text
V3__add_project_metrics.sql
V4__add_article_published_at.sql
```

Do not edit a migration after it has been applied. `baseline-on-migrate` is
enabled for the first rollout so an existing Hibernate-created database can be
adopted at version 1. After that rollout, set:

```env
SPRING_FLYWAY_BASELINE_ON_MIGRATE=false
```

The backend test suite applies the migrations to H2 in PostgreSQL compatibility
mode. When Docker is available, it also starts PostgreSQL 16 with Testcontainers
and verifies that Flyway migration and Hibernate schema validation both succeed.
The GitHub Actions backend job runs this PostgreSQL check on every push and pull
request.

## Production security

Activate the `prod` Spring profile in production:

```env
SPRING_PROFILES_ACTIVE=prod
```

The production profile requires HTTPS, enables HSTS, trusts forwarded protocol
headers, and marks the session cookie as `HttpOnly`, `Secure`, and `SameSite=Strict`.
The reverse proxy must terminate TLS and send the standard forwarded headers.

## Private backend access

Docker Compose publishes both Spring Boot and PostgreSQL only on the host
loopback interface by default:

```text
127.0.0.1:8080 -> backend
127.0.0.1:5432 -> PostgreSQL
```

This prevents direct access to these ports from the public network. Expose the
required `/api` routes through a TLS reverse proxy instead. The proxy should
forward requests to `http://127.0.0.1:8080` and send `Host`,
`X-Forwarded-For`, and `X-Forwarded-Proto` headers.

The Spring `prod` profile also binds to `127.0.0.1` when the application is run
directly on a host. Inside Docker, Spring listens on the container network while
Docker keeps the published host port bound to loopback. Do not change
`BACKEND_BIND_ADDRESS` or `POSTGRES_BIND_ADDRESS` to `0.0.0.0` in production.

Use a strong, unique initial admin password and disable
`APP_ADMIN_INITIALIZER_ENABLED` after the first account has been created.

## Changing and recovering the admin password

The password can be changed from the admin Settings page. Passwords must contain
12–128 characters with at least one letter and one number. A successful change
invalidates the current session.

If access is lost, use the one-time startup recovery mechanism. Set these values
through deployment secrets:

```env
APP_ADMIN_RECOVERY_ENABLED=true
APP_ADMIN_RECOVERY_EMAIL=admin@example.com
APP_ADMIN_RECOVERY_PASSWORD=a-new-strong-password-123
```

Start the backend once, verify the recovery warning in the logs, then immediately
set `APP_ADMIN_RECOVERY_ENABLED=false` and remove
`APP_ADMIN_RECOVERY_PASSWORD`. Recovery is intentionally not exposed as a public
HTTP endpoint.

## Contact form protection

The public contact form is protected at several layers:

- a per-IP submission window rejects excessive traffic with `429` and
  `Retry-After`;
- a hidden honeypot field silently discards automated submissions;
- an identical email-and-message pair is accepted only once during the
  configured duplicate window;
- requests larger than `APP_CONTACT_MAX_REQUEST_BYTES` are rejected with `413`
  before JSON parsing;
- read messages are archived after 30 days by default, and archived messages
  are deleted after 365 days;
- accepted messages can trigger an asynchronous email notification after the
  database transaction commits.

Tune the limits and retention policy with the `APP_CONTACT_*` values documented
in `.env.example`. The in-memory IP limiter is appropriate for the current
single-backend deployment. If several backend instances are deployed, replace
its local state with a shared limiter such as Redis.

Email notifications are disabled by default. To enable them, configure an SMTP
account using `SPRING_MAIL_HOST`, `SPRING_MAIL_PORT`,
`SPRING_MAIL_USERNAME`, `SPRING_MAIL_PASSWORD`, and the SMTP authentication/TLS
properties from `.env.example`, then set:

```env
APP_CONTACT_EMAIL_NOTIFICATIONS_ENABLED=true
APP_CONTACT_EMAIL_FROM=website@example.com
APP_CONTACT_EMAIL_TO=owner@example.com
```

Notification delivery happens asynchronously. A mail server failure is logged
but does not lose or roll back the saved contact message.

## PostgreSQL backups

Docker Compose runs a dedicated `postgres-backup` service. It creates a
compressed PostgreSQL custom-format archive when the service starts and then
once every 24 hours. Every completed archive is validated with `pg_restore
--list`, accompanied by a SHA-256 checksum, and kept for 14 days by default.
Temporary or failed dumps are not treated as completed backups.

Backups are written to `./backups/postgres` and are ignored by Git. Configure
the location, interval, retry delay, and retention in `.env`:

```env
POSTGRES_BACKUP_DIRECTORY=./backups/postgres
POSTGRES_BACKUP_INTERVAL_SECONDS=86400
POSTGRES_BACKUP_RETRY_SECONDS=300
POSTGRES_BACKUP_RETENTION_DAYS=14
```

Create an additional backup manually:

```bash
docker compose run --rm --entrypoint /bin/sh postgres-backup /scripts/backup.sh
```

Before restoring, copy the selected `.dump` and its `.sha256` file to a safe
location and stop the backend:

```bash
docker compose stop backend
docker compose run --rm --entrypoint /bin/sh postgres-backup \
  /scripts/restore.sh /backups/users_db_YYYYMMDDTHHMMSSZ.dump
docker compose start backend
```

Restore recreates the configured application database and is destructive for
its current contents. The checksum and archive structure are verified before
the database is dropped.

Backups stored on the same server do not protect against loss of that server.
Synchronize `POSTGRES_BACKUP_DIRECTORY` to encrypted off-site storage and
periodically test restoration on a separate PostgreSQL instance.
