package com.malik.personal_website.config;

import com.malik.personal_website.entities.UserEntity;
import com.malik.personal_website.enums.UserRole;
import com.malik.personal_website.repositories.UserRepository;
import com.malik.personal_website.services.PasswordPolicy;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@Order(10)
@RequiredArgsConstructor
@Slf4j
public class AdminUserInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordPolicy passwordPolicy;

    @Value("${app.admin.initializer.enabled:false}")
    private boolean enabled;

    @Value("${app.admin.initializer.email:}")
    private String email;

    @Value("${app.admin.initializer.password:}")
    private String password;

    @Override
    @Transactional
    public void run(String... args) {
        if (!enabled) {
            return;
        }

        String normalizedEmail = email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
        if (normalizedEmail.isBlank()) {
            throw new IllegalStateException("APP_ADMIN_EMAIL is required when admin initialization is enabled");
        }
        if (userRepository.findByEmail(normalizedEmail).isPresent()) {
            throw new IllegalStateException(
                    "Admin initialization is still enabled after bootstrap. "
                            + "Set APP_ADMIN_INITIALIZER_ENABLED=false and empty APP_ADMIN_PASSWORD."
            );
        }
        passwordPolicy.validate(password);

        UserEntity admin = new UserEntity();
        admin.setEmail(normalizedEmail);
        admin.setPasswordHash(passwordEncoder.encode(password));
        admin.setRole(UserRole.ADMIN);
        admin.setEnabled(true);

        userRepository.save(admin);
        log.warn(
                "Initial administrator {} was created. Before the next start, set "
                        + "APP_ADMIN_INITIALIZER_ENABLED=false and empty APP_ADMIN_PASSWORD.",
                normalizedEmail
        );
    }
}
