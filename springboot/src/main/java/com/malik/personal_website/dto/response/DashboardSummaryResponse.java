package com.malik.personal_website.dto.response;

public record DashboardSummaryResponse(
        long totalProjects,
        long draftProjects,
        long publishedProjects,
        long archivedProjects,
        long totalArticles,
        long draftArticles,
        long publishedArticles,
        long archivedArticles,
        long totalSkills,
        long visibleSkills,
        long hiddenSkills,
        long totalContactMessages,
        long newContactMessages,
        long readContactMessages,
        long archivedContactMessages
) {
}
