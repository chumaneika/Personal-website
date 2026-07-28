package com.malik.personal_website.dto.response;

import java.time.Instant;

public record ArticleSummaryResponse(
        Long id,
        String title,
        String slug,
        String summary,
        String coverImageUrl,
        String coverImageAvifUrl,
        String coverImageWebpUrl,
        Instant createdAt,
        Instant updatedAt
) {
}
