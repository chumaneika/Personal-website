package com.malik.personal_website.controllers;

import com.malik.personal_website.dto.ProfileRequest;
import com.malik.personal_website.dto.ProfileResponse;
import com.malik.personal_website.services.ProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/profile")
public class AdminProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ProfileResponse getProfile() {
        return ProfileResponse.from(profileService.getProfile());
    }

    @PutMapping
    public ProfileResponse upsertProfile(@Valid @RequestBody ProfileRequest request) {
        return ProfileResponse.from(profileService.upsertProfile(request));
    }
}
