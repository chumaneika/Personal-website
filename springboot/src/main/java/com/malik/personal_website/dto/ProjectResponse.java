package com.malik.personal_website.dto;

import com.malik.personal_website.entities.ProjectEntity;
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

    public static ProjectResponse from(ProjectEntity project) {
        return new ProjectResponse(
                project.getId(),
                project.getTitle(),
                project.getSlug(),
                project.getShortDescription(),
                project.getFullDescription(),
                project.getProblemDescription(),
                project.getSolutionDescription(),
                project.getTechnologyStack(),
                project.getGithubUrl(),
                project.getDemoUrl(),
                project.getCoverImageUrl(),
                project.getStatus(),
                project.getStartedAt(),
                project.getCompletedAt(),
                project.getCreatedAt(),
                project.getUpdatedAt()
        );
    }
}
