package com.malik.personal_website.dto;

public record DashboardSummaryResponse(
        long totalProjects,
        long draftProjects,
        long publishedProjects,
        long archivedProjects,
        long totalSkills,
        long visibleSkills,
        long hiddenSkills,
        long totalContactMessages,
        long newContactMessages,
        long readContactMessages,
        long archivedContactMessages
) {
}
