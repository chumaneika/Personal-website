package com.malik.personal_website.controllers;

import com.malik.personal_website.config.OpenApiConfig;
import com.malik.personal_website.dto.request.ProjectRequest;
import com.malik.personal_website.dto.response.ProjectResponse;
import com.malik.personal_website.dto.request.ProjectStatusUpdateRequest;
import com.malik.personal_website.dto.mapper.ProjectMapper;
import com.malik.personal_website.enums.PublicationStatus;
import com.malik.personal_website.services.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/projects")
@Tag(name = "Admin projects", description = "CRUD и публикация проектов.")
@SecurityRequirement(name = OpenApiConfig.SESSION_COOKIE_SCHEME)
public class AdminProjectController {

    private final ProjectService projectService;
    private final ProjectMapper projectMapper;

    @GetMapping
    @Operation(summary = "Получить все проекты")
    public List<ProjectResponse> getProjects(@RequestParam(required = false) PublicationStatus status) {
        return projectMapper.toResponses(projectService.getAdminProjects(status));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Получить проект по ID")
    public ProjectResponse getProject(@PathVariable Long id) {
        return projectMapper.toResponse(projectService.getAdminProject(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Создать проект")
    @Parameter(
            name = OpenApiConfig.CSRF_HEADER,
            in = ParameterIn.HEADER,
            required = true,
            description = "Токен из GET /api/auth/csrf."
    )
    public ProjectResponse createProject(@Valid @RequestBody ProjectRequest request) {
        return projectMapper.toResponse(projectService.createProject(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Полностью обновить проект")
    @Parameter(
            name = OpenApiConfig.CSRF_HEADER,
            in = ParameterIn.HEADER,
            required = true,
            description = "Токен из GET /api/auth/csrf."
    )
    public ProjectResponse updateProject(@PathVariable Long id, @Valid @RequestBody ProjectRequest request) {
        return projectMapper.toResponse(projectService.updateProject(id, request));
    }

    @PatchMapping("/{id}/status")
    @Operation(summary = "Изменить статус публикации проекта")
    @Parameter(
            name = OpenApiConfig.CSRF_HEADER,
            in = ParameterIn.HEADER,
            required = true,
            description = "Токен из GET /api/auth/csrf."
    )
    public ProjectResponse updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody ProjectStatusUpdateRequest request
    ) {
        return projectMapper.toResponse(projectService.updateStatus(id, request.status()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Удалить проект")
    @Parameter(
            name = OpenApiConfig.CSRF_HEADER,
            in = ParameterIn.HEADER,
            required = true,
            description = "Токен из GET /api/auth/csrf."
    )
    public void deleteProject(@PathVariable Long id) {
        projectService.deleteProject(id);
    }
}
