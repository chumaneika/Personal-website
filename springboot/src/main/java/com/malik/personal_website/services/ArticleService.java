package com.malik.personal_website.services;

import com.malik.personal_website.dto.request.ArticleRequest;
import com.malik.personal_website.entities.ArticleEntity;
import com.malik.personal_website.enums.PublicationStatus;
import com.malik.personal_website.exceptions.ResourceConflictException;
import com.malik.personal_website.exceptions.ResourceNotFoundException;
import com.malik.personal_website.repositories.ArticleRepository;
import java.util.List;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ArticleService {

    private final ArticleRepository articleRepository;

    @Transactional(readOnly = true)
    public List<ArticleEntity> getPublishedArticles() {
        return articleRepository.findByStatusOrderByCreatedAtDesc(PublicationStatus.PUBLISHED);
    }

    @Transactional(readOnly = true)
    public ArticleEntity getPublishedArticleBySlug(String slug) {
        return articleRepository.findBySlugAndStatus(slug.toLowerCase(Locale.ROOT), PublicationStatus.PUBLISHED)
                .orElseThrow(() -> new ResourceNotFoundException("Published article not found: " + slug));
    }

    @Transactional(readOnly = true)
    public List<ArticleEntity> getAdminArticles(PublicationStatus status) {
        if (status == null) {
            return articleRepository.findAllByOrderByCreatedAtDesc();
        }
        return articleRepository.findByStatusOrderByCreatedAtDesc(status);
    }

    @Transactional(readOnly = true)
    public ArticleEntity getAdminArticle(Long id) {
        return findArticle(id);
    }

    @Transactional
    public ArticleEntity createArticle(ArticleRequest request) {
        ArticleEntity article = new ArticleEntity();
        applyRequest(article, request);
        ensureSlugIsAvailable(article.getSlug(), null);
        return articleRepository.save(article);
    }

    @Transactional
    public ArticleEntity updateArticle(Long id, ArticleRequest request) {
        ArticleEntity article = findArticle(id);
        applyRequest(article, request);
        ensureSlugIsAvailable(article.getSlug(), id);
        return articleRepository.save(article);
    }

    @Transactional
    public ArticleEntity updateStatus(Long id, PublicationStatus status) {
        ArticleEntity article = findArticle(id);
        article.setStatus(status);
        return articleRepository.save(article);
    }

    @Transactional
    public void deleteArticle(Long id) {
        articleRepository.delete(findArticle(id));
    }

    private ArticleEntity findArticle(Long id) {
        return articleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Article not found: " + id));
    }

    private void applyRequest(ArticleEntity article, ArticleRequest request) {
        article.setTitle(request.title());
        article.setSlug(request.slug());
        article.setSummary(request.summary());
        article.setContent(request.content());
        article.setCoverImageUrl(request.coverImageUrl());
        article.setStatus(request.status() == null ? PublicationStatus.DRAFT : request.status());
    }

    private void ensureSlugIsAvailable(String slug, Long currentId) {
        boolean exists = currentId == null
                ? articleRepository.existsBySlug(slug)
                : articleRepository.existsBySlugAndIdNot(slug, currentId);

        if (exists) {
            throw new ResourceConflictException("Article slug already exists: " + slug);
        }
    }
}
