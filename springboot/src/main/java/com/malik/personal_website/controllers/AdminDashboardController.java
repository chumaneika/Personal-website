package com.malik.personal_website.controllers;

import com.malik.personal_website.dto.response.DashboardSummaryResponse;
import com.malik.personal_website.services.AdminDashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/dashboard")
public class AdminDashboardController {

    private final AdminDashboardService adminDashboardService;

    @GetMapping
    public DashboardSummaryResponse getSummary() {
        return adminDashboardService.getSummary();
    }
}
