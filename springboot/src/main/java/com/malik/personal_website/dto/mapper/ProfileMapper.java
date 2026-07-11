package com.malik.personal_website.dto.mapper;

import com.malik.personal_website.dto.response.ProfileResponse;
import com.malik.personal_website.entities.ProfileEntity;
import org.springframework.stereotype.Component;

@Component
public class ProfileMapper {

    public ProfileResponse toResponse(ProfileEntity profile) {
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
