package com.malik.personal_website.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record SkillCategoryRequest(
        @NotBlank @Size(max = 120) String name
) {
}
