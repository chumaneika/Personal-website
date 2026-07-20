package com.malik.personal_website.services;

import com.malik.personal_website.dto.request.SkillCategoryRequest;
import com.malik.personal_website.entities.SkillCategoryEntity;
import com.malik.personal_website.exceptions.ResourceConflictException;
import com.malik.personal_website.exceptions.ResourceNotFoundException;
import com.malik.personal_website.repositories.SkillCategoryRepository;
import com.malik.personal_website.repositories.SkillRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class SkillCategoryService {

    private final SkillCategoryRepository skillCategoryRepository;
    private final SkillRepository skillRepository;

    @Transactional(readOnly = true)
    public List<SkillCategoryEntity> getCategories() {
        return skillCategoryRepository.findAllByOrderByNameAsc();
    }

    @Transactional(readOnly = true)
    public SkillCategoryEntity getCategory(Long id) {
        return findCategory(id);
    }

    @Transactional
    public SkillCategoryEntity createCategory(SkillCategoryRequest request) {
        String name = request.name().trim();
        ensureNameIsAvailable(name, null);

        SkillCategoryEntity category = new SkillCategoryEntity();
        category.setName(name);
        return skillCategoryRepository.save(category);
    }

    @Transactional
    public SkillCategoryEntity updateCategory(Long id, SkillCategoryRequest request) {
        SkillCategoryEntity category = findCategory(id);
        String name = request.name().trim();
        ensureNameIsAvailable(name, id);

        category.setName(name);
        return skillCategoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(Long id) {
        SkillCategoryEntity category = findCategory(id);
        if (skillRepository.existsByCategory_Id(id)) {
            throw new ResourceConflictException("Skill category is used by existing skills: " + id);
        }
        skillCategoryRepository.delete(category);
    }

    private SkillCategoryEntity findCategory(Long id) {
        return skillCategoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Skill category not found: " + id));
    }

    private void ensureNameIsAvailable(String name, Long currentId) {
        boolean exists = currentId == null
                ? skillCategoryRepository.existsByNameIgnoreCase(name)
                : skillCategoryRepository.existsByNameIgnoreCaseAndIdNot(name, currentId);

        if (exists) {
            throw new ResourceConflictException("Skill category name already exists: " + name);
        }
    }
}
