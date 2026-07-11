package com.malik.personal_website.controllers;

import com.malik.personal_website.dto.response.ProjectResponse;
import com.malik.personal_website.dto.response.ProjectSummaryResponse;
import com.malik.personal_website.dto.mapper.ProjectMapper;
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
    private final ProjectMapper projectMapper;

    @GetMapping
    public List<ProjectSummaryResponse> getProjects() {
        return projectMapper.toSummaryResponses(projectService.getPublishedProjects());
    }

    @GetMapping("/{slug}")
    public ProjectResponse getProjectBySlug(@PathVariable String slug) {
        return projectMapper.toResponse(projectService.getPublishedProjectBySlug(slug));
    }
}
