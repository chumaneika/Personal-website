package com.malik.personal_website.entities;

import com.malik.personal_website.enums.PublicationStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.util.Locale;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Entity
@Table(
        name = "articles",
        uniqueConstraints = @UniqueConstraint(name = "uk_articles_slug", columnNames = "slug")
)
public class ArticleEntity extends BaseEntity {

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "slug", nullable = false, length = 180)
    private String slug;

    @Column(name = "summary", columnDefinition = "TEXT")
    private String summary;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "cover_image_url", length = 512)
    private String coverImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private PublicationStatus status = PublicationStatus.DRAFT;

    public void setTitle(String title) {
        this.title = requireText(title, "title", 200);
    }

    public void setSlug(String slug) {
        this.slug = requireText(slug, "slug", 180).toLowerCase(Locale.ROOT);
    }

    public void setSummary(String summary) {
        this.summary = normalizeOptionalText(summary, "summary");
    }

    public void setContent(String content) {
        this.content = requireText(content, "content");
    }

    public void setCoverImageUrl(String coverImageUrl) {
        this.coverImageUrl = normalizeOptionalText(coverImageUrl, "coverImageUrl", 512);
    }

    public void setStatus(PublicationStatus status) {
        this.status = requireValue(status, "status");
    }
}
