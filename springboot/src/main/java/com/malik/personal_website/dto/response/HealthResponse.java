package com.malik.personal_website.dto.response;

import java.time.Instant;

public record HealthResponse(
        String status,
        String application,
        Instant timestamp
) {
}
