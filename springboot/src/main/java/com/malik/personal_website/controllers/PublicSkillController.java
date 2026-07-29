package com.malik.personal_website.controllers;

import com.malik.personal_website.dto.response.SkillResponse;
import com.malik.personal_website.dto.mapper.SkillMapper;
import com.malik.personal_website.services.SkillService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/skills")
@Tag(name = "Public skills", description = "Видимые навыки с фильтрацией по категории.")
public class PublicSkillController {

    private final SkillService skillService;
    private final SkillMapper skillMapper;

    @GetMapping
    @Operation(summary = "Получить видимые навыки")
    public List<SkillResponse> getSkills(@RequestParam(required = false) Long categoryId) {
        return skillMapper.toResponses(skillService.getVisibleSkills(categoryId));
    }
}
