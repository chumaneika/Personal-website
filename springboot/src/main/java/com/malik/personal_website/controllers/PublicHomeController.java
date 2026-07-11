package com.malik.personal_website.controllers;

import com.malik.personal_website.dto.response.HomeResponse;
import com.malik.personal_website.services.HomeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/home")
public class PublicHomeController {

    private final HomeService homeService;

    @GetMapping
    public HomeResponse getHome() {
        return homeService.getHome();
    }
}
