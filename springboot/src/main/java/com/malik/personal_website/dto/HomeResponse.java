package com.malik.personal_website.dto;

import java.util.List;

public record HomeResponse(
        ProfileResponse profile,
        List<ProjectSummaryResponse> projects,
        List<SkillResponse> skills
) {
}
