package com.malik.personal_website.controllers;

import com.malik.personal_website.dto.response.HealthResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.time.Instant;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/health")
@Tag(name = "Public health", description = "Публичная проверка доступности API.")
public class HealthController {

    @Value("${spring.application.name}")
    private String applicationName;

    @GetMapping
    @Operation(summary = "Получить состояние API")
    public HealthResponse getHealth() {
        return new HealthResponse("UP", applicationName, Instant.now());
    }
}
