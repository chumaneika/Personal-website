package com.malik.personal_website.entities;

import com.malik.personal_website.enums.UserRole;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Entity
@Table(
        name = "users",
        uniqueConstraints = @UniqueConstraint(name = "uk_users_email", columnNames = "email")
)
public class UserEntity extends BaseEntity {

    @Column(name = "email", nullable = false, length = 254)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash;

    @Enumerated(EnumType.STRING)
    @Column(name = "role", nullable = false, length = 32)
    private UserRole role = UserRole.ADMIN;

    @Column(name = "enabled", nullable = false)
    private boolean enabled = true;

    public void setEmail(String email) {
        this.email = requireEmail(email, "email");
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = requireText(passwordHash, "passwordHash", 255);
    }

    public void setRole(UserRole role) {
        this.role = requireValue(role, "role");
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }
}
