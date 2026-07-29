package com.malik.personal_website.controllers;

import com.malik.personal_website.config.OpenApiConfig;
import com.malik.personal_website.dto.mapper.SkillCategoryMapper;
import com.malik.personal_website.dto.request.SkillCategoryRequest;
import com.malik.personal_website.dto.response.SkillCategoryResponse;
import com.malik.personal_website.services.SkillCategoryService;
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
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/skill-categories")
@Tag(name = "Admin skill categories", description = "CRUD категорий навыков.")
@SecurityRequirement(name = OpenApiConfig.SESSION_COOKIE_SCHEME)
public class AdminSkillCategoryController {

    private final SkillCategoryService skillCategoryService;
    private final SkillCategoryMapper skillCategoryMapper;

    @GetMapping
    @Operation(summary = "Получить категории навыков")
    public List<SkillCategoryResponse> getCategories() {
        return skillCategoryMapper.toResponses(skillCategoryService.getCategories());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Получить категорию навыков по ID")
    public SkillCategoryResponse getCategory(@PathVariable Long id) {
        return skillCategoryMapper.toResponse(skillCategoryService.getCategory(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Создать категорию навыков")
    @Parameter(
            name = OpenApiConfig.CSRF_HEADER,
            in = ParameterIn.HEADER,
            required = true,
            description = "Токен из GET /api/auth/csrf."
    )
    public SkillCategoryResponse createCategory(@Valid @RequestBody SkillCategoryRequest request) {
        return skillCategoryMapper.toResponse(skillCategoryService.createCategory(request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Полностью обновить категорию навыков")
    @Parameter(
            name = OpenApiConfig.CSRF_HEADER,
            in = ParameterIn.HEADER,
            required = true,
            description = "Токен из GET /api/auth/csrf."
    )
    public SkillCategoryResponse updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody SkillCategoryRequest request
    ) {
        return skillCategoryMapper.toResponse(skillCategoryService.updateCategory(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Удалить категорию навыков")
    @Parameter(
            name = OpenApiConfig.CSRF_HEADER,
            in = ParameterIn.HEADER,
            required = true,
            description = "Токен из GET /api/auth/csrf."
    )
    public void deleteCategory(@PathVariable Long id) {
        skillCategoryService.deleteCategory(id);
    }
}
