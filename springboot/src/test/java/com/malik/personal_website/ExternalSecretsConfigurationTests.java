package com.malik.personal_website;

import static org.assertj.core.api.Assertions.assertThat;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.boot.test.context.ConfigDataApplicationContextInitializer;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

class ExternalSecretsConfigurationTests {

    private final ApplicationContextRunner contextRunner =
            new ApplicationContextRunner()
                    .withInitializer(new ConfigDataApplicationContextInitializer());

    @Test
    void importsSensitiveSettingsFromExternalConfigTree(@TempDir Path secretsDirectory)
            throws IOException {
        writeSecret(secretsDirectory, "SPRING_DATASOURCE_PASSWORD", "database-test-secret");
        writeSecret(secretsDirectory, "APP_ADMIN_PASSWORD", "administrator-test-secret-123");
        writeSecret(secretsDirectory, "APP_ADMIN_RECOVERY_PASSWORD", "recovery-test-secret-123");
        writeSecret(secretsDirectory, "SPRING_MAIL_PASSWORD", "smtp-test-secret");

        contextRunner
                .withSystemProperties(
                        "APP_SECRETS_DIRECTORY="
                                + secretsDirectory.toAbsolutePath()
                                + File.separator)
                .run(
                        context -> {
                            assertThat(context).hasNotFailed();
                            assertThat(
                                            context.getEnvironment()
                                                    .getProperty("spring.datasource.password"))
                                    .isEqualTo("database-test-secret");
                            assertThat(
                                            context.getEnvironment()
                                                    .getProperty(
                                                            "app.admin.initializer.password"))
                                    .isEqualTo("administrator-test-secret-123");
                            assertThat(
                                            context.getEnvironment()
                                                    .getProperty("app.admin.recovery.password"))
                                    .isEqualTo("recovery-test-secret-123");
                            assertThat(
                                            context.getEnvironment()
                                                    .getProperty("spring.mail.password"))
                                    .isEqualTo("smtp-test-secret");
                        });
    }

    private static void writeSecret(Path directory, String filename, String value)
            throws IOException {
        Files.writeString(directory.resolve(filename), value);
    }
}
