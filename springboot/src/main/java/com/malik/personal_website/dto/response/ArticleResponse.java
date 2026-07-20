package com.malik.personal_website.dto.response;

import com.malik.personal_website.enums.PublicationStatus;
import java.time.Instant;

public record ArticleResponse(
        Long id,
        String title,
        String slug,
        String summary,
        String content,
        String coverImageUrl,
        PublicationStatus status,
        Instant createdAt,
        Instant updatedAt
) {
}
