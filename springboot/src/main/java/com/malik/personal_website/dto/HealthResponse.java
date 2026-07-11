package com.malik.personal_website.dto;

import java.time.Instant;

public record HealthResponse(
        String status,
        String application,
        Instant timestamp
) {
}
