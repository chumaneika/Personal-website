package com.malik.personal_website.dto.response;

import java.time.LocalDate;

public record ProjectSummaryResponse(
        Long id,
        String title,
        String slug,
        String shortDescription,
        String technologyStack,
        String githubUrl,
        String demoUrl,
        String coverImageUrl,
        LocalDate startedAt,
        LocalDate completedAt
) {
}
