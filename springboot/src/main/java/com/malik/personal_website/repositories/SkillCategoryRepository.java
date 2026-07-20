package com.malik.personal_website.repositories;

import com.malik.personal_website.entities.SkillCategoryEntity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SkillCategoryRepository extends JpaRepository<SkillCategoryEntity, Long> {

    List<SkillCategoryEntity> findAllByOrderByNameAsc();

    boolean existsByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCaseAndIdNot(String name, Long id);
}
