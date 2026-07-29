package com.malik.personal_website.controllers;

import com.malik.personal_website.dto.response.HomeResponse;
import com.malik.personal_website.services.HomeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/home")
@Tag(name = "Public home", description = "Агрегированные данные главной страницы.")
public class PublicHomeController {

    private final HomeService homeService;

    @GetMapping
    @Operation(summary = "Получить данные главной страницы")
    public HomeResponse getHome() {
        return homeService.getHome();
    }
}
