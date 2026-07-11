package com.malik.personal_website.repositories;

import com.malik.personal_website.entities.ProjectEntity;
import com.malik.personal_website.enums.PublicationStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectRepository extends JpaRepository<ProjectEntity, Long> {

    List<ProjectEntity> findAllByOrderByCreatedAtDesc();

    List<ProjectEntity> findByStatusOrderByCreatedAtDesc(PublicationStatus status);

    Optional<ProjectEntity> findBySlugAndStatus(String slug, PublicationStatus status);

    long countByStatus(PublicationStatus status);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);
}
