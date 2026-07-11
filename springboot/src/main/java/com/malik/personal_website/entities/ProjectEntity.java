package com.malik.personal_website.entities;

import com.malik.personal_website.enums.PublicationStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import java.time.LocalDate;
import java.util.Locale;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Entity
@Table(
        name = "projects",
        uniqueConstraints = @UniqueConstraint(name = "uk_projects_slug", columnNames = "slug")
)
public class ProjectEntity extends BaseEntity {

    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "slug", nullable = false, length = 180)
    private String slug;

    @Column(name = "short_description", columnDefinition = "TEXT")
    private String shortDescription;

    @Column(name = "full_description", columnDefinition = "TEXT")
    private String fullDescription;

    @Column(name = "problem_description", columnDefinition = "TEXT")
    private String problemDescription;

    @Column(name = "solution_description", columnDefinition = "TEXT")
    private String solutionDescription;

    @Column(name = "technology_stack", columnDefinition = "TEXT")
    private String technologyStack;

    @Column(name = "github_url", length = 512)
    private String githubUrl;

    @Column(name = "demo_url", length = 512)
    private String demoUrl;

    @Column(name = "cover_image_url", length = 512)
    private String coverImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 32)
    private PublicationStatus status = PublicationStatus.DRAFT;

    @Column(name = "started_at")
    private LocalDate startedAt;

    @Column(name = "completed_at")
    private LocalDate completedAt;

    public void setTitle(String title) {
        this.title = requireText(title, "title", 200);
    }

    public void setSlug(String slug) {
        this.slug = requireText(slug, "slug", 180).toLowerCase(Locale.ROOT);
    }

    public void setShortDescription(String shortDescription) {
        this.shortDescription = normalizeOptionalText(shortDescription, "shortDescription");
    }

    public void setFullDescription(String fullDescription) {
        this.fullDescription = normalizeOptionalText(fullDescription, "fullDescription");
    }

    public void setProblemDescription(String problemDescription) {
        this.problemDescription = normalizeOptionalText(problemDescription, "problemDescription");
    }

    public void setSolutionDescription(String solutionDescription) {
        this.solutionDescription = normalizeOptionalText(solutionDescription, "solutionDescription");
    }

    public void setTechnologyStack(String technologyStack) {
        this.technologyStack = normalizeOptionalText(technologyStack, "technologyStack");
    }

    public void setGithubUrl(String githubUrl) {
        this.githubUrl = normalizeOptionalText(githubUrl, "githubUrl", 512);
    }

    public void setDemoUrl(String demoUrl) {
        this.demoUrl = normalizeOptionalText(demoUrl, "demoUrl", 512);
    }

    public void setCoverImageUrl(String coverImageUrl) {
        this.coverImageUrl = normalizeOptionalText(coverImageUrl, "coverImageUrl", 512);
    }

    public void setStatus(PublicationStatus status) {
        this.status = requireValue(status, "status");
    }

    public void setStartedAt(LocalDate startedAt) {
        if (startedAt != null && completedAt != null && completedAt.isBefore(startedAt)) {
            throw new IllegalArgumentException("startedAt must not be after completedAt");
        }
        this.startedAt = startedAt;
    }

    public void setCompletedAt(LocalDate completedAt) {
        if (startedAt != null && completedAt != null && completedAt.isBefore(startedAt)) {
            throw new IllegalArgumentException("completedAt must not be before startedAt");
        }
        this.completedAt = completedAt;
    }
}
