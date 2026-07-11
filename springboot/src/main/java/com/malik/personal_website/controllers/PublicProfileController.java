package com.malik.personal_website.controllers;

import com.malik.personal_website.dto.ProfileResponse;
import com.malik.personal_website.services.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/profile")
public class PublicProfileController {

    private final ProfileService profileService;

    @GetMapping
    public ProfileResponse getProfile() {
        return ProfileResponse.from(profileService.getProfile());
    }
}
