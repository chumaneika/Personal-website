package com.malik.personal_website.controllers;

import com.malik.personal_website.dto.response.ProjectResponse;
import com.malik.personal_website.dto.response.ErrorResponse;
import com.malik.personal_website.dto.response.ProjectSummaryResponse;
import com.malik.personal_website.dto.mapper.ProjectMapper;
import com.malik.personal_website.services.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/projects")
@Tag(name = "Public projects", description = "Опубликованные проекты.")
public class PublicProjectController {

    private final ProjectService projectService;
    private final ProjectMapper projectMapper;

    @GetMapping
    @Operation(summary = "Получить опубликованные проекты")
    public List<ProjectSummaryResponse> getProjects() {
        return projectMapper.toSummaryResponses(projectService.getPublishedProjects());
    }

    @GetMapping("/{slug}")
    @Operation(summary = "Получить опубликованный проект по slug")
    @ApiResponse(
            responseCode = "404",
            description = "Опубликованный проект не найден",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
    )
    public ProjectResponse getProjectBySlug(@PathVariable String slug) {
        return projectMapper.toResponse(projectService.getPublishedProjectBySlug(slug));
    }
}
