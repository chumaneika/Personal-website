# Database migrations

Flyway applies migrations in version order when the backend starts.

- Never edit an applied migration.
- Add schema changes as a new file such as `V3__add_project_metrics.sql`.
- Keep each migration forward-only and safe for existing production data.
- Test migrations against PostgreSQL before deployment.
- Hibernate uses `ddl-auto=validate`; JPA entities do not create or update the schema.

`baseline-on-migrate` is disabled by default. Enable it explicitly only for the
one-time adoption of a database that was created before Flyway was introduced.
Such a database is baselined at version 1, then receives `V2` and every later
migration. Return `SPRING_FLYWAY_BASELINE_ON_MIGRATE=false` immediately after
that deployment.
