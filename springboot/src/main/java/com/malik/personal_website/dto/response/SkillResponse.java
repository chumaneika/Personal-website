package com.malik.personal_website.dto.response;

import com.malik.personal_website.enums.SkillLevel;
import java.time.Instant;

public record SkillResponse(
        Long id,
        String name,
        SkillCategoryResponse category,
        SkillLevel level,
        int sortOrder,
        boolean visible,
        Instant createdAt,
        Instant updatedAt
) {
}
