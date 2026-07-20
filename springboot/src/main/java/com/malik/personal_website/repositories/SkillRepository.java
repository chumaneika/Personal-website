package com.malik.personal_website.repositories;

import com.malik.personal_website.entities.SkillEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SkillRepository extends JpaRepository<SkillEntity, Long> {

    List<SkillEntity> findAllByOrderBySortOrderAscNameAsc();

    List<SkillEntity> findByVisibleTrueOrderBySortOrderAscNameAsc();

    List<SkillEntity> findByVisibleTrueAndCategory_IdOrderBySortOrderAscNameAsc(Long categoryId);

    boolean existsByCategory_Id(Long categoryId);

    long countByVisibleTrue();

    long countByVisibleFalse();
}
