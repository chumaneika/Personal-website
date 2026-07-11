package com.malik.personal_website.dto.mapper;

import com.malik.personal_website.dto.response.SkillCategoryResponse;
import com.malik.personal_website.entities.SkillCategoryEntity;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class SkillCategoryMapper {

    public SkillCategoryResponse toResponse(SkillCategoryEntity category) {
        return new SkillCategoryResponse(
                category.getId(),
                category.getName()
        );
    }

    public List<SkillCategoryResponse> toResponses(List<SkillCategoryEntity> categories) {
        return categories.stream()
                .map(this::toResponse)
                .toList();
    }
}
