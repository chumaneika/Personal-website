package com.malik.personal_website.controllers;

import com.malik.personal_website.dto.SkillResponse;
import com.malik.personal_website.enums.SkillCategory;
import com.malik.personal_website.services.SkillService;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/skills")
public class PublicSkillController {

    private final SkillService skillService;

    @GetMapping
    public List<SkillResponse> getSkills(@RequestParam(required = false) SkillCategory category) {
        return skillService.getVisibleSkills(category)
                .stream()
                .map(SkillResponse::from)
                .toList();
    }
}
