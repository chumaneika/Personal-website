package com.malik.personal_website.controllers;

import com.malik.personal_website.dto.mapper.SkillCategoryMapper;
import com.malik.personal_website.dto.request.SkillCategoryRequest;
import com.malik.personal_website.dto.response.SkillCategoryResponse;
import com.malik.personal_website.services.SkillCategoryService;
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
public class AdminSkillCategoryController {

    private final SkillCategoryService skillCategoryService;
    private final SkillCategoryMapper skillCategoryMapper;

    @GetMapping
    public List<SkillCategoryResponse> getCategories() {
        return skillCategoryMapper.toResponses(skillCategoryService.getCategories());
    }

    @GetMapping("/{id}")
    public SkillCategoryResponse getCategory(@PathVariable Long id) {
        return skillCategoryMapper.toResponse(skillCategoryService.getCategory(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SkillCategoryResponse createCategory(@Valid @RequestBody SkillCategoryRequest request) {
        return skillCategoryMapper.toResponse(skillCategoryService.createCategory(request));
    }

    @PutMapping("/{id}")
    public SkillCategoryResponse updateCategory(
            @PathVariable Long id,
            @Valid @RequestBody SkillCategoryRequest request
    ) {
        return skillCategoryMapper.toResponse(skillCategoryService.updateCategory(id, request));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteCategory(@PathVariable Long id) {
        skillCategoryService.deleteCategory(id);
    }
}
