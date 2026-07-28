package com.malik.personal_website.services;

import com.malik.personal_website.entities.ArticleEntity;
import com.malik.personal_website.entities.ProjectEntity;
import com.malik.personal_website.enums.PublicationStatus;
import com.malik.personal_website.repositories.ArticleRepository;
import com.malik.personal_website.repositories.ProjectRepository;
import java.time.format.DateTimeFormatter;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.util.HtmlUtils;
import org.springframework.web.util.UriComponentsBuilder;

@Service
@RequiredArgsConstructor
public class SitemapService {

    private static final List<String> STATIC_PATHS = List.of(
            "",
            "about",
            "projects",
            "blog",
            "skills",
            "resume",
            "contacts"
    );

    private final ProjectRepository projectRepository;
    private final ArticleRepository articleRepository;

    @Transactional(readOnly = true)
    public String generate(String baseUrl) {
        String normalizedBaseUrl = baseUrl.replaceAll("/+$", "");
        StringBuilder xml = new StringBuilder("""
                <?xml version="1.0" encoding="UTF-8"?>
                <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
                """);

        for (String path : STATIC_PATHS) {
            appendUrl(xml, buildUrl(normalizedBaseUrl, path), null);
        }

        projectRepository.findByStatusOrderByCreatedAtDesc(PublicationStatus.PUBLISHED)
                .forEach(project -> appendProject(xml, normalizedBaseUrl, project));
        articleRepository.findByStatusOrderByCreatedAtDesc(PublicationStatus.PUBLISHED)
                .forEach(article -> appendArticle(xml, normalizedBaseUrl, article));

        return xml.append("</urlset>\n").toString();
    }

    private void appendProject(StringBuilder xml, String baseUrl, ProjectEntity project) {
        appendUrl(
                xml,
                buildUrl(baseUrl, "projects", project.getSlug()),
                DateTimeFormatter.ISO_INSTANT.format(project.getUpdatedAt())
        );
    }

    private void appendArticle(StringBuilder xml, String baseUrl, ArticleEntity article) {
        appendUrl(
                xml,
                buildUrl(baseUrl, "blog", article.getSlug()),
                DateTimeFormatter.ISO_INSTANT.format(article.getUpdatedAt())
        );
    }

    private String buildUrl(String baseUrl, String... pathSegments) {
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(baseUrl);
        if (pathSegments.length == 1 && pathSegments[0].isEmpty()) {
            return builder.path("/").build().encode().toUriString();
        }
        return builder.pathSegment(pathSegments).build().encode().toUriString();
    }

    private void appendUrl(StringBuilder xml, String url, String lastModified) {
        xml.append("  <url>\n")
                .append("    <loc>")
                .append(HtmlUtils.htmlEscape(url))
                .append("</loc>\n");
        if (lastModified != null) {
            xml.append("    <lastmod>")
                    .append(lastModified)
                    .append("</lastmod>\n");
        }
        xml.append("  </url>\n");
    }
}
