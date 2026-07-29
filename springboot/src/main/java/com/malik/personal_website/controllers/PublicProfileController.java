package com.malik.personal_website.controllers;

import com.malik.personal_website.dto.response.ProfileResponse;
import com.malik.personal_website.dto.mapper.ProfileMapper;
import com.malik.personal_website.dto.response.ErrorResponse;
import com.malik.personal_website.services.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/profile")
@Tag(name = "Public profile", description = "Опубликованный профиль владельца сайта.")
public class PublicProfileController {

    private final ProfileService profileService;
    private final ProfileMapper profileMapper;

    @GetMapping
    @Operation(summary = "Получить публичный профиль")
    @ApiResponse(
            responseCode = "404",
            description = "Профиль ещё не создан",
            content = @Content(schema = @Schema(implementation = ErrorResponse.class))
    )
    public ProfileResponse getProfile() {
        return profileMapper.toResponse(profileService.getProfile());
    }
}
