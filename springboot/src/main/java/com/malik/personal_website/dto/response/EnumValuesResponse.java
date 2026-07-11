package com.malik.personal_website.dto.response;

import java.util.List;

public record EnumValuesResponse(
        List<String> publicationStatuses,
        List<SkillCategoryResponse> skillCategories,
        List<String> skillLevels,
        List<String> contactMessageStatuses
) {
}
