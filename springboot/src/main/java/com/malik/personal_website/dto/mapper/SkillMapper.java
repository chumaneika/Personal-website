package com.malik.personal_website.dto.mapper;

import com.malik.personal_website.dto.response.SkillResponse;
import com.malik.personal_website.entities.SkillEntity;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SkillMapper {

    private final SkillCategoryMapper skillCategoryMapper;

    public SkillResponse toResponse(SkillEntity skill) {
        return new SkillResponse(
                skill.getId(),
                skill.getName(),
                skillCategoryMapper.toResponse(skill.getCategory()),
                skill.getLevel(),
                skill.getSortOrder(),
                skill.isVisible(),
                skill.getCreatedAt(),
                skill.getUpdatedAt()
        );
    }

    public List<SkillResponse> toResponses(List<SkillEntity> skills) {
        return skills.stream()
                .map(this::toResponse)
                .toList();
    }
}
