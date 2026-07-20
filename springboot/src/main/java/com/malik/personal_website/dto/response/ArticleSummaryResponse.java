package com.malik.personal_website.dto.response;

import java.time.Instant;

public record ArticleSummaryResponse(
        Long id,
        String title,
        String slug,
        String summary,
        String coverImageUrl,
        Instant createdAt,
        Instant updatedAt
) {
}
