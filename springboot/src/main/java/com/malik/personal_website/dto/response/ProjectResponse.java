package com.malik.personal_website.dto.response;

import com.malik.personal_website.enums.PublicationStatus;
import java.time.Instant;
import java.time.LocalDate;

public record ProjectResponse(
        Long id,
        String title,
        String slug,
        String shortDescription,
        String fullDescription,
        String problemDescription,
        String solutionDescription,
        String technologyStack,
        String githubUrl,
        String demoUrl,
        String coverImageUrl,
        PublicationStatus status,
        LocalDate startedAt,
        LocalDate completedAt,
        Instant createdAt,
        Instant updatedAt
) {
}
