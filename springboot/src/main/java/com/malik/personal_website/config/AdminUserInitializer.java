package com.malik.personal_website.config;

import com.malik.personal_website.entities.UserEntity;
import com.malik.personal_website.enums.UserRole;
import com.malik.personal_website.repositories.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Component
@RequiredArgsConstructor
public class AdminUserInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.initializer.enabled}")
    private boolean enabled;

    @Value("${app.admin.initializer.email}")
    private String email;

    @Value("${app.admin.initializer.password}")
    private String password;

    @Override
    @Transactional
    public void run(String... args) {
        if (!enabled || userRepository.findByEmail(email).isPresent()) {
            return;
        }

        UserEntity admin = new UserEntity();
        admin.setEmail(email);
        admin.setPasswordHash(passwordEncoder.encode(password));
        admin.setRole(UserRole.ADMIN);
        admin.setEnabled(true);

        userRepository.save(admin);
    }
}
