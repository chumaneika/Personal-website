package com.malik.personal_website.entities;

import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.MappedSuperclass;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import java.time.Instant;
import java.util.Locale;
import java.util.Objects;
import lombok.Getter;

@Getter
@MappedSuperclass
public abstract class BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false, updatable = false)
    private Long id;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @PrePersist
    protected void onCreate() {
        Instant now = Instant.now();
        createdAt = now;
        updatedAt = now;
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = Instant.now();
    }

    protected static String requireText(String value, String fieldName) {
        String normalized = normalizeOptionalText(value, fieldName);
        if (normalized == null) {
            throw new IllegalArgumentException(fieldName + " must not be blank");
        }
        return normalized;
    }

    protected static String requireText(String value, String fieldName, int maxLength) {
        String normalized = normalizeOptionalText(value, fieldName, maxLength);
        if (normalized == null) {
            throw new IllegalArgumentException(fieldName + " must not be blank");
        }
        return normalized;
    }

    protected static String requireEmail(String value, String fieldName) {
        return requireText(value, fieldName, 254).toLowerCase(Locale.ROOT);
    }

    protected static String normalizeOptionalEmail(String value, String fieldName) {
        String normalized = normalizeOptionalText(value, fieldName, 254);
        return normalized == null ? null : normalized.toLowerCase(Locale.ROOT);
    }

    protected static String normalizeOptionalText(String value, String fieldName) {
        if (value == null) {
            return null;
        }

        String normalized = value.trim();
        return normalized.isBlank() ? null : normalized;
    }

    protected static String normalizeOptionalText(String value, String fieldName, int maxLength) {
        String normalized = normalizeOptionalText(value, fieldName);
        if (normalized != null && normalized.length() > maxLength) {
            throw new IllegalArgumentException(fieldName + " must be at most " + maxLength + " characters");
        }
        return normalized;
    }

    protected static <T> T requireValue(T value, String fieldName) {
        return Objects.requireNonNull(value, fieldName + " must not be null");
    }
}
