package com.malik.personal_website.dto;

import com.malik.personal_website.entities.ProfileEntity;
import java.time.Instant;

public record ProfileResponse(
        Long id,
        String firstName,
        String lastName,
        String headline,
        String shortBio,
        String fullBio,
        String location,
        String email,
        String telegramUrl,
        String githubUrl,
        String linkedinUrl,
        String avatarUrl,
        String resumeUrl,
        Instant createdAt,
        Instant updatedAt
) {

    public static ProfileResponse from(ProfileEntity profile) {
        return new ProfileResponse(
                profile.getId(),
                profile.getFirstName(),
                profile.getLastName(),
                profile.getHeadline(),
                profile.getShortBio(),
                profile.getFullBio(),
                profile.getLocation(),
                profile.getEmail(),
                profile.getTelegramUrl(),
                profile.getGithubUrl(),
                profile.getLinkedinUrl(),
                profile.getAvatarUrl(),
                profile.getResumeUrl(),
                profile.getCreatedAt(),
                profile.getUpdatedAt()
        );
    }
}
