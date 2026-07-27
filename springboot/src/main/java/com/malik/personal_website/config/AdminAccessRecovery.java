package com.malik.personal_website.config;

import com.malik.personal_website.entities.UserEntity;
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

@Slf4j
@Component
@Order(20)
@RequiredArgsConstructor
public class AdminAccessRecovery implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final PasswordPolicy passwordPolicy;

    @Value("${app.admin.recovery.enabled:false}")
    private boolean enabled;

    @Value("${app.admin.recovery.email:}")
    private String email;

    @Value("${app.admin.recovery.password:}")
    private String password;

    @Override
    @Transactional
    public void run(String... args) {
        if (!enabled) {
            return;
        }

        String normalizedEmail = email == null ? "" : email.trim().toLowerCase(Locale.ROOT);
        if (normalizedEmail.isBlank()) {
            throw new IllegalStateException("APP_ADMIN_RECOVERY_EMAIL is required when recovery is enabled");
        }
        passwordPolicy.validate(password);

        UserEntity admin = userRepository.findByEmail(normalizedEmail)
                .orElseThrow(() -> new IllegalStateException("Recovery admin account was not found"));
        admin.setPasswordHash(passwordEncoder.encode(password));
        admin.setEnabled(true);
        userRepository.save(admin);

        log.warn(
                "Admin access was recovered for {}. Disable APP_ADMIN_RECOVERY_ENABLED and remove the recovery password.",
                normalizedEmail
        );
    }
}
