package com.malik.personal_website.repositories;

import com.malik.personal_website.entities.ArticleEntity;
import com.malik.personal_website.enums.PublicationStatus;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ArticleRepository extends JpaRepository<ArticleEntity, Long> {

    List<ArticleEntity> findAllByOrderByCreatedAtDesc();

    List<ArticleEntity> findByStatusOrderByCreatedAtDesc(PublicationStatus status);

    Optional<ArticleEntity> findBySlugAndStatus(String slug, PublicationStatus status);

    long countByStatus(PublicationStatus status);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, Long id);
}
