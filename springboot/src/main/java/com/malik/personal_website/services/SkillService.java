package com.malik.personal_website.services;

import com.malik.personal_website.dto.SkillRequest;
import com.malik.personal_website.entities.SkillEntity;
import com.malik.personal_website.enums.SkillCategory;
import com.malik.personal_website.exceptions.ResourceNotFoundException;
import com.malik.personal_website.repositories.SkillRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SkillService {

    private final SkillRepository skillRepository;

    @Transactional(readOnly = true)
    public List<SkillEntity> getVisibleSkills(SkillCategory category) {
        if (category == null) {
            return skillRepository.findByVisibleTrueOrderBySortOrderAscNameAsc();
        }
        return skillRepository.findByVisibleTrueAndCategoryOrderBySortOrderAscNameAsc(category);
    }

    @Transactional(readOnly = true)
    public List<SkillEntity> getAdminSkills() {
        return skillRepository.findAllByOrderBySortOrderAscNameAsc();
    }

    @Transactional(readOnly = true)
    public SkillEntity getAdminSkill(Long id) {
        return findSkill(id);
    }

    @Transactional
    public SkillEntity createSkill(SkillRequest request) {
        SkillEntity skill = new SkillEntity();
        applyRequest(skill, request);
        return skillRepository.save(skill);
    }

    @Transactional
    public SkillEntity updateSkill(Long id, SkillRequest request) {
        SkillEntity skill = findSkill(id);
        applyRequest(skill, request);
        return skillRepository.save(skill);
    }

    @Transactional
    public SkillEntity updateVisibility(Long id, boolean visible) {
        SkillEntity skill = findSkill(id);
        skill.setVisible(visible);
        return skillRepository.save(skill);
    }

    @Transactional
    public void deleteSkill(Long id) {
        SkillEntity skill = findSkill(id);
        skillRepository.delete(skill);
    }

    private SkillEntity findSkill(Long id) {
        return skillRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill not found: " + id));
    }

    private void applyRequest(SkillEntity skill, SkillRequest request) {
        skill.setName(request.name());
        skill.setCategory(request.category());
        skill.setLevel(request.level());
        skill.setSortOrder(request.sortOrder() == null ? 0 : request.sortOrder());
        skill.setVisible(request.visible() == null || request.visible());
    }
}
