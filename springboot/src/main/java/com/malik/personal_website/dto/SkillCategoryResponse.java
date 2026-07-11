package com.malik.personal_website.dto;

import com.malik.personal_website.entities.SkillCategoryEntity;

public record SkillCategoryResponse(
        Long id,
        String name
) {

    public static SkillCategoryResponse from(SkillCategoryEntity category) {
        return new SkillCategoryResponse(
                category.getId(),
                category.getName()
        );
    }
}
