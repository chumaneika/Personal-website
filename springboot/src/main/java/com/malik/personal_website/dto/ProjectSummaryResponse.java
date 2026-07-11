package com.malik.personal_website.dto;

import com.malik.personal_website.entities.ProjectEntity;
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

    public static ProjectSummaryResponse from(ProjectEntity project) {
        return new ProjectSummaryResponse(
                project.getId(),
                project.getTitle(),
                project.getSlug(),
                project.getShortDescription(),
                project.getTechnologyStack(),
                project.getGithubUrl(),
                project.getDemoUrl(),
                project.getCoverImageUrl(),
                project.getStartedAt(),
                project.getCompletedAt()
        );
    }
}
