package com.malik.personal_website.controllers;

import com.malik.personal_website.dto.mapper.SkillCategoryMapper;
import com.malik.personal_website.dto.response.SkillCategoryResponse;
import com.malik.personal_website.services.SkillCategoryService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/skill-categories")
public class PublicSkillCategoryController {

    private final SkillCategoryService skillCategoryService;
    private final SkillCategoryMapper skillCategoryMapper;

    @GetMapping
    public List<SkillCategoryResponse> getCategories() {
        return skillCategoryMapper.toResponses(skillCategoryService.getCategories());
    }
}
