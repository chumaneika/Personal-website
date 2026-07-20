package com.malik.personal_website.dto.mapper;

import com.malik.personal_website.dto.response.ArticleResponse;
import com.malik.personal_website.dto.response.ArticleSummaryResponse;
import com.malik.personal_website.entities.ArticleEntity;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class ArticleMapper {

    public ArticleResponse toResponse(ArticleEntity article) {
        return new ArticleResponse(
                article.getId(),
                article.getTitle(),
                article.getSlug(),
                article.getSummary(),
                article.getContent(),
                article.getCoverImageUrl(),
                article.getStatus(),
                article.getCreatedAt(),
                article.getUpdatedAt()
        );
    }

    public ArticleSummaryResponse toSummaryResponse(ArticleEntity article) {
        return new ArticleSummaryResponse(
                article.getId(),
                article.getTitle(),
                article.getSlug(),
                article.getSummary(),
                article.getCoverImageUrl(),
                article.getCreatedAt(),
                article.getUpdatedAt()
        );
    }

    public List<ArticleResponse> toResponses(List<ArticleEntity> articles) {
        return articles.stream().map(this::toResponse).toList();
    }

    public List<ArticleSummaryResponse> toSummaryResponses(List<ArticleEntity> articles) {
        return articles.stream().map(this::toSummaryResponse).toList();
    }
}
