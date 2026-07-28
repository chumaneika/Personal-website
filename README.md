# Personal Website

Monorepo with two frontend applications:

- `frontend-public` - public-facing React Router application rendered by Node.js
- `frontend-admin` - admin interface

Both frontends use React, TypeScript, Vite, React Router, SCSS, Axios, TanStack
Query, React Hook Form, and Zod. The public frontend uses React Router 7
Framework Mode with server-side rendering; the admin remains a browser-only SPA.

The backend uses Java 17, Spring Boot, Spring Security, Spring Data JPA, and PostgreSQL.
The production deployment also includes Actuator, Prometheus, Alertmanager,
Blackbox Exporter, Grafana, Loki, Alloy, and optional Sentry error reporting.

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
npm run build:public
npm run build:admin
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

## Frontend production builds

The two deployable frontends are built and verified independently:

```bash
npm ci
npm run build:public
npm run build:admin
```

The commands run React Router type generation and TypeScript checks, create
production builds without source maps, and verify the generated entry assets.
The public build contains `frontend-public/build/server` for the Node SSR
runtime and `frontend-public/build/client` for browser assets. The admin SPA is
written to `frontend-admin/dist`.

The public SSR server reads data through `PUBLIC_BACKEND_INTERNAL_URL`. This is
a Node runtime variable and is never embedded into the browser bundle. The
contact form and the admin SPA use the same-origin `/api` endpoint by default.
For a separate browser API origin, set `PUBLIC_FRONTEND_API_URL` or
`ADMIN_FRONTEND_API_URL` before building the Docker images. Browser variables
are public and must never contain secrets.

Build both production images with:

```bash
docker compose build frontend-public frontend-admin
```

The CI pipeline uses Node.js `22.17.1` from `.nvmrc` and Temurin Java
`17.0.19+10` from `.java-version`. Every pull request to `main` and every push
to `main` runs:

- frontend formatting, lint, type checks, and all Vitest tests;
- independent production builds for the public and admin frontends;
- the complete backend test suite;
- PostgreSQL 16 Testcontainers checks for Flyway migrations, Hibernate schema
  validation, constraints, and repository access;
- Docker Compose validation and production image builds.

The stable aggregate check is named `CI / Required`. Configure the `main`
branch protection rule to require this check and require the branch to be up to
date before merging. A failure or cancellation in any CI job then blocks the
merge.

Run the backend with Java 17:

```bash
cd springboot
./mvnw spring-boot:run
```

Then run the public SSR frontend:

```bash
PUBLIC_BACKEND_INTERNAL_URL=http://localhost:8080/api \
PUBLIC_SITE_ORIGIN=http://localhost:5173 \
npm run dev:public
```

For a local production-mode check:

```bash
npm run build:public
cd frontend-public
PUBLIC_BACKEND_INTERNAL_URL=http://localhost:8080/api \
PUBLIC_SITE_ORIGIN=http://localhost:3000 \
PORT=3000 npm run start
```

Copy `.env.example` to `.env` before starting the backend or Docker Compose.
The file contains configuration only; passwords must not be added to it.

## External secrets

Sensitive deployment values are stored as files in a directory outside the
repository. Create the directory, generate the database and Grafana passwords,
create the one-time bootstrap/recovery and optional SMTP files, and provide the
Alertmanager receiver URL:

```bash
install -d -m 700 /secure/path/personal-website-secrets
openssl rand -hex 32 | tr -d '\n' > /secure/path/personal-website-secrets/SPRING_DATASOURCE_PASSWORD
openssl rand -hex 32 | tr -d '\n' > /secure/path/personal-website-secrets/GRAFANA_ADMIN_PASSWORD
touch /secure/path/personal-website-secrets/APP_ADMIN_PASSWORD
touch /secure/path/personal-website-secrets/APP_ADMIN_RECOVERY_PASSWORD
touch /secure/path/personal-website-secrets/SPRING_MAIL_PASSWORD
printf '%s' 'https://alerts.example.com/alertmanager' \
  > /secure/path/personal-website-secrets/ALERTMANAGER_WEBHOOK_URL
chmod 600 /secure/path/personal-website-secrets/*
```

Set the absolute external directory path in `.env`:

```env
APP_SECRETS_DIRECTORY=/secure/path/personal-website-secrets
```

Docker Compose mounts only the secret files required by each service under
`/run/secrets`; their values are not placed in Compose, `.env`, container
environment variables, or images. PostgreSQL reads its password through
`POSTGRES_PASSWORD_FILE`, while Spring Boot imports its mounted files as a
configuration tree.

For a direct host run, `APP_SECRETS_DIRECTORY` is loaded from the root `.env`.
Keep the six filenames exactly as shown above. The Alertmanager URL must point
to a receiver that accepts Alertmanager webhook JSON. On a managed deployment,
the same files can be materialized by the platform's secret manager instead of
being created manually.

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
disabled by default. Enable it only for the one-time adoption of an existing
Hibernate-created database at version 1, then immediately return it to:

```env
SPRING_FLYWAY_BASELINE_ON_MIGRATE=false
```

The backend test suite applies the migrations to H2 in PostgreSQL compatibility
mode. When Docker is available, it also starts PostgreSQL 16 with Testcontainers
and verifies that Flyway migration and Hibernate schema validation both succeed.
The GitHub Actions backend job runs this PostgreSQL check on every push and pull
request.

## Production security

Production uses the separate
`springboot/src/main/resources/application-prod.yaml` profile:

```env
SPRING_PROFILES_ACTIVE=prod
```

The production profile requires HTTPS, enables HSTS, trusts forwarded protocol
headers, marks the session cookie as `HttpOnly`, `Secure`, and `SameSite=Strict`,
hides error details, enables graceful shutdown, validates the Hibernate schema,
and keeps Flyway clean and automatic baseline operations disabled. The bundled
edge proxy terminates TLS and sends the standard forwarded headers.

## HTTPS deployment and private services

Docker Compose builds the public React Router server and the admin Vite SPA.
The public site runs in a non-root Node.js container, the admin runs in its
existing non-root Nginx container, and Caddy sits in front of both:

```text
Internet :80/:443
        |
   edge-proxy
      /    \
Node SSR  admin SPA
      \    /
   Spring Boot
         |
     PostgreSQL
```

Only Caddy publishes host ports. The frontend containers are reachable only
from the edge and application Docker networks, Spring Boot is reachable only
from the application network, and PostgreSQL is attached exclusively to the
internal database network. PostgreSQL has no host port mapping.

For the public domain, Caddy sends `/api/*`, `/robots.txt`, and `/sitemap.xml`
directly to Spring Boot. Every other public URL goes to the Node SSR frontend.
The Node server loads page data from `http://backend:8080/api` inside Docker and
returns content and SEO metadata in the initial HTML. The admin domain continues
to use the unchanged Nginx SPA runtime.

Set `PUBLIC_DOMAIN`, `ADMIN_DOMAIN`, `ACME_EMAIL`,
`PUBLIC_BACKEND_INTERNAL_URL`, and `PUBLIC_SITE_ORIGIN` in `.env`. Compose uses
the Docker-internal backend URL and derives the production site origin from
`PUBLIC_DOMAIN`; the explicit values in `.env` also document the equivalent
settings for direct runs outside Compose. Point both domains' A/AAAA records to
the server and allow inbound TCP ports 80 and 443 plus UDP port 443. Set the two
exact HTTPS origins in `APP_CORS_ALLOWED_ORIGINS`.

Set a new immutable `RELEASE_VERSION` before each deployment. Compose applies
the same tag to every application image, which allows the complete application
set to be rolled back without rebuilding:

```env
RELEASE_VERSION=2026.07.28-1
```

Start or rebuild the complete deployment with:

```bash
docker compose up --build -d
```

Caddy obtains certificates automatically, redirects HTTP to HTTPS, and renews
managed certificates before expiration. Its `/data` and `/config` directories
use persistent Docker volumes, so certificates and ACME state survive container
replacement. Do not delete `caddy_data` during routine deployments.

The public Node runtime exposes `/healthz`. Missing public routes and missing
project or article slugs return a real HTTP `404`; the admin Nginx runtime keeps
its SPA fallback. Hashed Vite assets are still served from the public build.

Verify the deployment:

```bash
docker compose ps
curl -I "https://${PUBLIC_DOMAIN}/healthz"
curl -I "https://${PUBLIC_DOMAIN}/projects/example"
curl -I "https://${ADMIN_DOMAIN}/login"
```

## Observability

The backend exposes internal-only Actuator endpoints:

```text
/actuator/health/liveness
/actuator/health/readiness
/actuator/prometheus
```

Readiness includes the PostgreSQL health indicator; liveness intentionally does
not depend on external services. Docker uses readiness for backend health, and
Prometheus records request rate, HTTP 5xx ratio, response-time histograms, and
p95 latency. Blackbox Exporter checks the configured public and admin HTTPS
URLs end to end.

Backend logs and proxy access logs are written as JSON to stdout. Alloy
discovers the Compose containers and sends all stdout/stderr logs to Loki.
Grafana is provisioned with Prometheus and Loki datasources plus the
`Personal website overview` dashboard. Grafana, Prometheus, and Alertmanager
bind to `127.0.0.1` by default.

Set the Sentry variables from `.env.example` to enable backend and browser error
reporting. Blank DSNs leave each SDK disabled. Because Vite variables are
embedded at build time, rebuild the frontend images after changing a frontend
DSN or release.

Alertmanager sends both firing and resolved notifications to the URL stored in
`ALERTMANAGER_WEBHOOK_URL`. The complete setup, validation commands, alert
thresholds, log queries, and incident procedures are in
[docs/observability-runbook.md](docs/observability-runbook.md).

To access PostgreSQL for maintenance, execute the client inside the database
container instead of publishing port 5432:

```bash
docker compose exec postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"
```

The complete application and database rollback procedure is documented in
[docs/release-rollback.md](docs/release-rollback.md).

## One-time administrator bootstrap

Automatic administrator creation is disabled by default. For a fresh database:

1. Put a strong, unique password in the external `APP_ADMIN_PASSWORD` file.

   ```bash
   openssl rand -hex 32 | tr -d '\n' \
     > /secure/path/personal-website-secrets/APP_ADMIN_PASSWORD
   chmod 600 /secure/path/personal-website-secrets/APP_ADMIN_PASSWORD
   ```

2. Set these values in `.env`:

   ```env
   APP_ADMIN_INITIALIZER_ENABLED=true
   APP_ADMIN_EMAIL=admin@example.com
   ```

3. Start the backend and verify that the administrator can sign in:

   ```bash
   docker compose up -d
   ```

4. Immediately set `APP_ADMIN_INITIALIZER_ENABLED=false`, empty the external
   `APP_ADMIN_PASSWORD` file, and recreate the backend:

   ```bash
   docker compose up -d --force-recreate backend
   ```

If bootstrap remains enabled after the account exists, the next backend start
fails intentionally. This prevents a deleted administrator account from being
silently recreated with a retained bootstrap password.

## Changing and recovering the admin password

The password can be changed from the admin Settings page. Passwords must contain
12–128 characters with at least one letter and one number. A successful change
invalidates the current session.

If access is lost, use the one-time startup recovery mechanism. Set these values
in `.env`:

```env
APP_ADMIN_RECOVERY_ENABLED=true
APP_ADMIN_RECOVERY_EMAIL=admin@example.com
```

Write the new password to the external `APP_ADMIN_RECOVERY_PASSWORD` file, start
the backend once, and verify the recovery warning in the logs. Then immediately
set `APP_ADMIN_RECOVERY_ENABLED=false` and empty the password file. Recovery is
intentionally not exposed as a public HTTP endpoint.

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
`SPRING_MAIL_USERNAME`, and the SMTP authentication/TLS properties from
`.env.example`. Put the SMTP password in the external `SPRING_MAIL_PASSWORD`
file, then set:

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
