package com.malik.personal_website.repositories;

import com.malik.personal_website.entities.SkillEntity;
import com.malik.personal_website.enums.SkillCategory;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SkillRepository extends JpaRepository<SkillEntity, Long> {

    List<SkillEntity> findAllByOrderBySortOrderAscNameAsc();

    List<SkillEntity> findByVisibleTrueOrderBySortOrderAscNameAsc();

    List<SkillEntity> findByVisibleTrueAndCategoryOrderBySortOrderAscNameAsc(SkillCategory category);

    long countByVisibleTrue();

    long countByVisibleFalse();
}
