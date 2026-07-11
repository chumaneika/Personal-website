package com.malik.personal_website.dto.request;

import com.malik.personal_website.enums.SkillLevel;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public record SkillRequest(
        @NotBlank @Size(max = 120) String name,
        @NotNull @Positive Long categoryId,
        @NotNull SkillLevel level,
        @Min(0) Integer sortOrder,
        Boolean visible
) {
}
