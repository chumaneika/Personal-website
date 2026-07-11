package com.malik.personal_website.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ProfileRequest(
        @NotBlank @Size(max = 100) String firstName,
        @NotBlank @Size(max = 100) String lastName,
        @NotBlank @Size(max = 160) String headline,
        String shortBio,
        String fullBio,
        @Size(max = 160) String location,
        @Email @Size(max = 254) String email,
        @Size(max = 512) String telegramUrl,
        @Size(max = 512) String githubUrl,
        @Size(max = 512) String linkedinUrl,
        @Size(max = 512) String avatarUrl,
        @Size(max = 512) String resumeUrl
) {
}
