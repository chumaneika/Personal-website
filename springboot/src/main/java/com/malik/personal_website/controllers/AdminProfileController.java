package com.malik.personal_website.controllers;

import com.malik.personal_website.config.OpenApiConfig;
import com.malik.personal_website.dto.request.ProfileRequest;
import com.malik.personal_website.dto.response.ProfileResponse;
import com.malik.personal_website.dto.mapper.ProfileMapper;
import com.malik.personal_website.services.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.enums.ParameterIn;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Admin profile", description = "Чтение и обновление профиля владельца сайта.")
@SecurityRequirement(name = OpenApiConfig.SESSION_COOKIE_SCHEME)
public class AdminProfileController {

    private final ProfileService profileService;
    private final ProfileMapper profileMapper;

    @GetMapping
    @Operation(summary = "Получить профиль для редактирования")
    public ProfileResponse getProfile() {
        return profileMapper.toResponse(profileService.getProfile());
    }

    @PutMapping
    @Operation(summary = "Создать или полностью обновить профиль")
    @Parameter(
            name = OpenApiConfig.CSRF_HEADER,
            in = ParameterIn.HEADER,
            required = true,
            description = "Токен из GET /api/auth/csrf."
    )
    public ProfileResponse upsertProfile(@Valid @RequestBody ProfileRequest request) {
        return profileMapper.toResponse(profileService.upsertProfile(request));
    }
}
