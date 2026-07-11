package com.malik.personal_website.dto;

import com.malik.personal_website.enums.SkillCategory;
import com.malik.personal_website.enums.SkillLevel;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SkillRequest(
        @NotBlank @Size(max = 120) String name,
        @NotNull SkillCategory category,
        @NotNull SkillLevel level,
        @Min(0) Integer sortOrder,
        Boolean visible
) {
}
