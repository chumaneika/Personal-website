package com.malik.personal_website;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

import com.malik.personal_website.entities.ProjectEntity;
import com.malik.personal_website.enums.PublicationStatus;
import com.malik.personal_website.repositories.ProjectRepository;
import java.sql.Connection;
import java.sql.Date;
import java.time.LocalDate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.testcontainers.service.connection.ServiceConnection;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.testcontainers.containers.PostgreSQLContainer;
import org.testcontainers.junit.jupiter.Container;
import org.testcontainers.junit.jupiter.Testcontainers;

@Testcontainers(disabledWithoutDocker = true)
@ActiveProfiles("test")
@SpringBootTest(properties = {
        "spring.flyway.baseline-on-migrate=false",
        "spring.jpa.hibernate.ddl-auto=validate",
        "app.admin.initializer.enabled=false"
})
class PostgreSqlMigrationIntegrationTests {

    @Container
    @ServiceConnection
    static final PostgreSQLContainer<?> POSTGRESQL = new PostgreSQLContainer<>("postgres:16-alpine");

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private ProjectRepository projectRepository;

    @BeforeEach
    void setUp() {
        projectRepository.deleteAll();
    }

    @Test
    void flywayMigratesAndRepositoriesWorkAgainstPostgreSql() throws Exception {
        try (Connection connection = jdbcTemplate.getDataSource().getConnection()) {
            assertEquals("PostgreSQL", connection.getMetaData().getDatabaseProductName());
        }

        Integer appliedMigrations = jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM flyway_schema_history WHERE success = TRUE",
                Integer.class
        );
        assertTrue(appliedMigrations != null && appliedMigrations >= 3);

        ProjectEntity project = new ProjectEntity();
        project.setTitle("Testcontainers project");
        project.setSlug("testcontainers-project");
        project.setShortDescription("Stored in a real PostgreSQL container");
        project.setStatus(PublicationStatus.PUBLISHED);
        project.setStartedAt(LocalDate.of(2026, 1, 1));
        project.setCompletedAt(LocalDate.of(2026, 7, 1));

        ProjectEntity saved = projectRepository.saveAndFlush(project);

        ProjectEntity loaded = projectRepository
                .findBySlugAndStatus("testcontainers-project", PublicationStatus.PUBLISHED)
                .orElseThrow();
        assertEquals(saved.getId(), loaded.getId());
        assertEquals(LocalDate.of(2026, 7, 1), loaded.getCompletedAt());
    }

    @Test
    void PostgreSqlEnforcesProjectDateAndSlugConstraints() {
        insertProject("database-constraints", "2026-01-01", "2026-07-01");

        assertThrows(
                DataIntegrityViolationException.class,
                () -> insertProject("invalid-dates", "2026-07-02", "2026-07-01")
        );
        assertThrows(
                DataIntegrityViolationException.class,
                () -> insertProject("database-constraints", "2026-01-01", "2026-07-01")
        );
    }

    private void insertProject(String slug, String startedAt, String completedAt) {
        jdbcTemplate.update(
                """
                        INSERT INTO projects (
                            id,
                            created_at,
                            updated_at,
                            title,
                            slug,
                            status,
                            started_at,
                            completed_at
                        )
                        VALUES (
                            nextval('base_seq'),
                            CURRENT_TIMESTAMP,
                            CURRENT_TIMESTAMP,
                            'PostgreSQL constraint test',
                            ?,
                            'DRAFT',
                            ?,
                            ?
                        )
                        """,
                slug,
                Date.valueOf(startedAt),
                Date.valueOf(completedAt)
        );
    }
}
