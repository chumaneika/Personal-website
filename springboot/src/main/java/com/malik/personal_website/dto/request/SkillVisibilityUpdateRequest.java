package com.malik.personal_website.dto.request;

import jakarta.validation.constraints.NotNull;

public record SkillVisibilityUpdateRequest(
        @NotNull Boolean visible
) {
}
