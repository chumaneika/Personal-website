package com.malik.personal_website.controllers;

import com.malik.personal_website.dto.mapper.SkillCategoryMapper;
import com.malik.personal_website.dto.response.SkillCategoryResponse;
import com.malik.personal_website.services.SkillCategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/skill-categories")
@Tag(name = "Public skill categories", description = "Категории навыков.")
public class PublicSkillCategoryController {

    private final SkillCategoryService skillCategoryService;
    private final SkillCategoryMapper skillCategoryMapper;

    @GetMapping
    @Operation(summary = "Получить категории навыков")
    public List<SkillCategoryResponse> getCategories() {
        return skillCategoryMapper.toResponses(skillCategoryService.getCategories());
    }
}
