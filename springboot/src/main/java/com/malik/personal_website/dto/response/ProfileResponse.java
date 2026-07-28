package com.malik.personal_website.dto.response;

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
        String avatarAvifUrl,
        String avatarWebpUrl,
        String resumeUrl,
        Instant createdAt,
        Instant updatedAt
) {
}
