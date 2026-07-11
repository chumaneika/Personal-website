package com.malik.personal_website.services;

import com.malik.personal_website.dto.ProfileRequest;
import com.malik.personal_website.entities.ProfileEntity;
import com.malik.personal_website.exceptions.ResourceNotFoundException;
import com.malik.personal_website.repositories.ProfileRepository;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProfileService {

    private final ProfileRepository profileRepository;

    @Transactional(readOnly = true)
    public ProfileEntity getProfile() {
        return profileRepository.findFirstByOrderByIdAsc()
                .orElseThrow(() -> new ResourceNotFoundException("Profile is not configured yet"));
    }

    @Transactional(readOnly = true)
    public Optional<ProfileEntity> findProfile() {
        return profileRepository.findFirstByOrderByIdAsc();
    }

    @Transactional
    public ProfileEntity upsertProfile(ProfileRequest request) {
        ProfileEntity profile = profileRepository.findFirstByOrderByIdAsc()
                .orElseGet(ProfileEntity::new);

        applyRequest(profile, request);
        return profileRepository.save(profile);
    }

    private void applyRequest(ProfileEntity profile, ProfileRequest request) {
        profile.setFirstName(request.firstName());
        profile.setLastName(request.lastName());
        profile.setHeadline(request.headline());
        profile.setShortBio(request.shortBio());
        profile.setFullBio(request.fullBio());
        profile.setLocation(request.location());
        profile.setEmail(request.email());
        profile.setTelegramUrl(request.telegramUrl());
        profile.setGithubUrl(request.githubUrl());
        profile.setLinkedinUrl(request.linkedinUrl());
        profile.setAvatarUrl(request.avatarUrl());
        profile.setResumeUrl(request.resumeUrl());
    }
}
