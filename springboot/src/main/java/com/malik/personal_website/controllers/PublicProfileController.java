package com.malik.personal_website.controllers;

import com.malik.personal_website.dto.response.ProfileResponse;
import com.malik.personal_website.dto.mapper.ProfileMapper;
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
    private final ProfileMapper profileMapper;

    @GetMapping
    public ProfileResponse getProfile() {
        return profileMapper.toResponse(profileService.getProfile());
    }
}
