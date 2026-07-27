package com.malik.personal_website;

import static org.assertj.core.api.Assertions.assertThat;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.ConfigDataApplicationContextInitializer;
import org.springframework.boot.test.context.runner.ApplicationContextRunner;

class ProductionProfileConfigurationTests {

    private final ApplicationContextRunner contextRunner =
            new ApplicationContextRunner()
                    .withInitializer(new ConfigDataApplicationContextInitializer())
                    .withPropertyValues("spring.profiles.active=prod")
                    .withSystemProperties(
                            "APP_CORS_ALLOWED_ORIGINS=https://www.example.com,https://admin.example.com",
                            "APP_ADMIN_INITIALIZER_ENABLED=false",
                            "SPRING_FLYWAY_BASELINE_ON_MIGRATE=false"
                    );

    @Test
    void appliesHardenedProductionDefaults() {
        contextRunner.run(
                context -> {
                    assertThat(context).hasNotFailed();
                    assertThat(context.getEnvironment().getActiveProfiles()).containsExactly("prod");
                    assertThat(context.getEnvironment().getProperty("server.forward-headers-strategy"))
                            .isEqualTo("framework");
                    assertThat(context.getEnvironment().getProperty("server.shutdown"))
                            .isEqualTo("graceful");
                    assertThat(context.getEnvironment().getProperty("server.servlet.session.cookie.secure"))
                            .isEqualTo("true");
                    assertThat(context.getEnvironment().getProperty("server.servlet.session.cookie.same-site"))
                            .isEqualTo("strict");
                    assertThat(context.getEnvironment().getProperty("spring.jpa.hibernate.ddl-auto"))
                            .isEqualTo("validate");
                    assertThat(context.getEnvironment().getProperty("spring.flyway.clean-disabled"))
                            .isEqualTo("true");
                    assertThat(context.getEnvironment().getProperty("spring.flyway.baseline-on-migrate"))
                            .isEqualTo("false");
                    assertThat(context.getEnvironment().getProperty("app.admin.initializer.enabled"))
                            .isEqualTo("false");
                    assertThat(context.getEnvironment().getProperty("app.security.require-https"))
                            .isEqualTo("true");
                });
    }
}
