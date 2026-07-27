# Database migrations

Flyway applies migrations in version order when the backend starts.

- Never edit an applied migration.
- Add schema changes as a new file such as `V3__add_project_metrics.sql`.
- Keep each migration forward-only and safe for existing production data.
- Test migrations against PostgreSQL before deployment.
- Hibernate uses `ddl-auto=validate`; JPA entities do not create or update the schema.

`baseline-on-migrate` is enabled by default only to adopt databases that were
created before Flyway was introduced. Such a database is baselined at version 1,
then receives `V2` and every later migration. After the first successful
deployment to an existing database, set
`SPRING_FLYWAY_BASELINE_ON_MIGRATE=false`.
