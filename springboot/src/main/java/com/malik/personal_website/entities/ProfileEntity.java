package com.malik.personal_website.entities;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Getter
@NoArgsConstructor
@Entity
@Table(name = "profiles")
public class ProfileEntity extends BaseEntity {

    @Column(name = "first_name", nullable = false, length = 100)
    private String firstName;

    @Column(name = "last_name", nullable = false, length = 100)
    private String lastName;

    @Column(name = "headline", nullable = false, length = 160)
    private String headline;

    @Column(name = "short_bio", columnDefinition = "TEXT")
    private String shortBio;

    @Column(name = "full_bio", columnDefinition = "TEXT")
    private String fullBio;

    @Column(name = "location", length = 160)
    private String location;

    @Column(name = "email", length = 254)
    private String email;

    @Column(name = "telegram_url", length = 512)
    private String telegramUrl;

    @Column(name = "github_url", length = 512)
    private String githubUrl;

    @Column(name = "linkedin_url", length = 512)
    private String linkedinUrl;

    @Column(name = "avatar_url", length = 512)
    private String avatarUrl;

    @Column(name = "resume_url", length = 512)
    private String resumeUrl;

    public void setFirstName(String firstName) {
        this.firstName = requireText(firstName, "firstName", 100);
    }

    public void setLastName(String lastName) {
        this.lastName = requireText(lastName, "lastName", 100);
    }

    public void setHeadline(String headline) {
        this.headline = requireText(headline, "headline", 160);
    }

    public void setShortBio(String shortBio) {
        this.shortBio = normalizeOptionalText(shortBio, "shortBio");
    }

    public void setFullBio(String fullBio) {
        this.fullBio = normalizeOptionalText(fullBio, "fullBio");
    }

    public void setLocation(String location) {
        this.location = normalizeOptionalText(location, "location", 160);
    }

    public void setEmail(String email) {
        this.email = normalizeOptionalEmail(email, "email");
    }

    public void setTelegramUrl(String telegramUrl) {
        this.telegramUrl = normalizeOptionalText(telegramUrl, "telegramUrl", 512);
    }

    public void setGithubUrl(String githubUrl) {
        this.githubUrl = normalizeOptionalText(githubUrl, "githubUrl", 512);
    }

    public void setLinkedinUrl(String linkedinUrl) {
        this.linkedinUrl = normalizeOptionalText(linkedinUrl, "linkedinUrl", 512);
    }

    public void setAvatarUrl(String avatarUrl) {
        this.avatarUrl = normalizeOptionalText(avatarUrl, "avatarUrl", 512);
    }

    public void setResumeUrl(String resumeUrl) {
        this.resumeUrl = normalizeOptionalText(resumeUrl, "resumeUrl", 512);
    }
}
