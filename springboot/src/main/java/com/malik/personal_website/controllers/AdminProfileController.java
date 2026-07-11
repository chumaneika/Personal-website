package com.malik.personal_website.controllers;

import com.malik.personal_website.dto.request.ProfileRequest;
import com.malik.personal_website.dto.response.ProfileResponse;
import com.malik.personal_website.dto.mapper.ProfileMapper;
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
    private final ProfileMapper profileMapper;

    @GetMapping
    public ProfileResponse getProfile() {
        return profileMapper.toResponse(profileService.getProfile());
    }

    @PutMapping
    public ProfileResponse upsertProfile(@Valid @RequestBody ProfileRequest request) {
        return profileMapper.toResponse(profileService.upsertProfile(request));
    }
}
