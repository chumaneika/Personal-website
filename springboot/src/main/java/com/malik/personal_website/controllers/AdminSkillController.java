package com.malik.personal_website.controllers;

import com.malik.personal_website.dto.SkillRequest;
import com.malik.personal_website.dto.SkillResponse;
import com.malik.personal_website.dto.SkillVisibilityUpdateRequest;
import com.malik.personal_website.services.SkillService;
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
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/skills")
public class AdminSkillController {

    private final SkillService skillService;

    @GetMapping
    public List<SkillResponse> getSkills() {
        return skillService.getAdminSkills()
                .stream()
                .map(SkillResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public SkillResponse getSkill(@PathVariable Long id) {
        return SkillResponse.from(skillService.getAdminSkill(id));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public SkillResponse createSkill(@Valid @RequestBody SkillRequest request) {
        return SkillResponse.from(skillService.createSkill(request));
    }

    @PutMapping("/{id}")
    public SkillResponse updateSkill(@PathVariable Long id, @Valid @RequestBody SkillRequest request) {
        return SkillResponse.from(skillService.updateSkill(id, request));
    }

    @PatchMapping("/{id}/visibility")
    public SkillResponse updateVisibility(
            @PathVariable Long id,
            @Valid @RequestBody SkillVisibilityUpdateRequest request
    ) {
        return SkillResponse.from(skillService.updateVisibility(id, request.visible()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSkill(@PathVariable Long id) {
        skillService.deleteSkill(id);
    }
}
