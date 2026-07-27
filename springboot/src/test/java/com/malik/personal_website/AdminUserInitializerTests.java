package com.malik.personal_website;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.malik.personal_website.config.AdminUserInitializer;
import com.malik.personal_website.entities.UserEntity;
import com.malik.personal_website.enums.UserRole;
import com.malik.personal_website.repositories.UserRepository;
import com.malik.personal_website.services.PasswordPolicy;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.util.ReflectionTestUtils;

@ExtendWith(MockitoExtension.class)
class AdminUserInitializerTests {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private PasswordPolicy passwordPolicy;

    @InjectMocks
    private AdminUserInitializer initializer;

    @BeforeEach
    void configureInitializer() {
        ReflectionTestUtils.setField(initializer, "enabled", true);
        ReflectionTestUtils.setField(initializer, "email", " Admin@Example.com ");
        ReflectionTestUtils.setField(initializer, "password", "bootstrap-password-123");
    }

    @Test
    void doesNothingWhenInitializationIsDisabled() {
        ReflectionTestUtils.setField(initializer, "enabled", false);

        initializer.run();

        verifyNoInteractions(userRepository, passwordEncoder, passwordPolicy);
    }

    @Test
    void createsInitialAdministratorOnce() {
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.empty());
        when(passwordEncoder.encode("bootstrap-password-123")).thenReturn("encoded-password");

        initializer.run();

        verify(passwordPolicy).validate("bootstrap-password-123");
        ArgumentCaptor<UserEntity> adminCaptor = ArgumentCaptor.forClass(UserEntity.class);
        verify(userRepository).save(adminCaptor.capture());

        UserEntity admin = adminCaptor.getValue();
        assertThat(admin.getEmail()).isEqualTo("admin@example.com");
        assertThat(admin.getPasswordHash()).isEqualTo("encoded-password");
        assertThat(admin.getRole()).isEqualTo(UserRole.ADMIN);
        assertThat(admin.isEnabled()).isTrue();
    }

    @Test
    void refusesToStartWhenBootstrapWasNotDisabled() {
        when(userRepository.findByEmail("admin@example.com")).thenReturn(Optional.of(new UserEntity()));

        assertThatThrownBy(initializer::run)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("APP_ADMIN_INITIALIZER_ENABLED=false");

        verify(userRepository, never()).save(any());
        verifyNoInteractions(passwordEncoder, passwordPolicy);
    }

    @Test
    void requiresEmailWhenInitializationIsEnabled() {
        ReflectionTestUtils.setField(initializer, "email", " ");

        assertThatThrownBy(initializer::run)
                .isInstanceOf(IllegalStateException.class)
                .hasMessageContaining("APP_ADMIN_EMAIL");

        verifyNoInteractions(userRepository, passwordEncoder, passwordPolicy);
    }
}
