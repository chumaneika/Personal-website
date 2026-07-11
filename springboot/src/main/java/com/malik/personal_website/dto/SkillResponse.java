package com.malik.personal_website.dto;

import com.malik.personal_website.entities.SkillEntity;
import com.malik.personal_website.enums.SkillCategory;
import com.malik.personal_website.enums.SkillLevel;
import java.time.Instant;

public record SkillResponse(
        Long id,
        String name,
        SkillCategory category,
        SkillLevel level,
        int sortOrder,
        boolean visible,
        Instant createdAt,
        Instant updatedAt
) {

    public static SkillResponse from(SkillEntity skill) {
        return new SkillResponse(
                skill.getId(),
                skill.getName(),
                skill.getCategory(),
                skill.getLevel(),
                skill.getSortOrder(),
                skill.isVisible(),
                skill.getCreatedAt(),
                skill.getUpdatedAt()
        );
    }
}
