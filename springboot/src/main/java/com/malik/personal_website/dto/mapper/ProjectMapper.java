package com.malik.personal_website.dto.mapper;

import com.malik.personal_website.dto.response.ProjectResponse;
import com.malik.personal_website.dto.response.ProjectSummaryResponse;
import com.malik.personal_website.entities.ProjectEntity;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class ProjectMapper {

    public ProjectResponse toResponse(ProjectEntity project) {
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

    public ProjectSummaryResponse toSummaryResponse(ProjectEntity project) {
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

    public List<ProjectResponse> toResponses(List<ProjectEntity> projects) {
        return projects.stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ProjectSummaryResponse> toSummaryResponses(List<ProjectEntity> projects) {
        return projects.stream()
                .map(this::toSummaryResponse)
                .toList();
    }
}
