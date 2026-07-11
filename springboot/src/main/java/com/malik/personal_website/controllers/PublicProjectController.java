package com.malik.personal_website.controllers;

import com.malik.personal_website.dto.ProjectResponse;
import com.malik.personal_website.dto.ProjectSummaryResponse;
import com.malik.personal_website.services.ProjectService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/projects")
public class PublicProjectController {

    private final ProjectService projectService;

    @GetMapping
    public List<ProjectSummaryResponse> getProjects() {
        return projectService.getPublishedProjects()
                .stream()
                .map(ProjectSummaryResponse::from)
                .toList();
    }

    @GetMapping("/{slug}")
    public ProjectResponse getProjectBySlug(@PathVariable String slug) {
        return ProjectResponse.from(projectService.getPublishedProjectBySlug(slug));
    }
}
