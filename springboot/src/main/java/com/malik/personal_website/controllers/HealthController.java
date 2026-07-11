package com.malik.personal_website.controllers;

import com.malik.personal_website.dto.response.HealthResponse;
import java.time.Instant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
public class HealthController {

    @Value("${spring.application.name}")
    private String applicationName;

    @GetMapping
    public HealthResponse getHealth() {
        return new HealthResponse("UP", applicationName, Instant.now());
    }
}
