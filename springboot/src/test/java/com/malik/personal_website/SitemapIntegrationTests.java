package com.malik.personal_website;

import static org.hamcrest.Matchers.containsString;
import static org.hamcrest.Matchers.not;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.malik.personal_website.entities.ArticleEntity;
import com.malik.personal_website.entities.ProjectEntity;
import com.malik.personal_website.enums.PublicationStatus;
import com.malik.personal_website.repositories.ArticleRepository;
import com.malik.personal_website.repositories.ProjectRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class SitemapIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private ArticleRepository articleRepository;

    @BeforeEach
    void setUp() {
        projectRepository.deleteAll();
        articleRepository.deleteAll();
    }

    @Test
    void sitemapContainsStaticAndPublishedContentOnly() throws Exception {
        ProjectEntity publishedProject = new ProjectEntity();
        publishedProject.setTitle("Payment service");
        publishedProject.setSlug("payment-service");
        publishedProject.setStatus(PublicationStatus.PUBLISHED);
        projectRepository.saveAndFlush(publishedProject);

        ProjectEntity draftProject = new ProjectEntity();
        draftProject.setTitle("Secret project");
        draftProject.setSlug("secret-project");
        draftProject.setStatus(PublicationStatus.DRAFT);
        projectRepository.saveAndFlush(draftProject);

        ArticleEntity publishedArticle = new ArticleEntity();
        publishedArticle.setTitle("Spring Security");
        publishedArticle.setSlug("spring-security");
        publishedArticle.setContent("Article body");
        publishedArticle.setStatus(PublicationStatus.PUBLISHED);
        articleRepository.saveAndFlush(publishedArticle);

        ArticleEntity archivedArticle = new ArticleEntity();
        archivedArticle.setTitle("Old article");
        archivedArticle.setSlug("old-article");
        archivedArticle.setContent("Archived body");
        archivedArticle.setStatus(PublicationStatus.ARCHIVED);
        articleRepository.saveAndFlush(archivedArticle);

        mockMvc.perform(get("/sitemap.xml").with(request -> {
                    request.setScheme("https");
                    request.setServerName("portfolio.example");
                    request.setServerPort(443);
                    request.setSecure(true);
                    return request;
                }))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.APPLICATION_XML))
                .andExpect(content().string(containsString(
                        "<loc>https://portfolio.example/</loc>"
                )))
                .andExpect(content().string(containsString(
                        "<loc>https://portfolio.example/contacts</loc>"
                )))
                .andExpect(content().string(containsString(
                        "<loc>https://portfolio.example/projects/payment-service</loc>"
                )))
                .andExpect(content().string(containsString(
                        "<loc>https://portfolio.example/blog/spring-security</loc>"
                )))
                .andExpect(content().string(containsString("<lastmod>")))
                .andExpect(content().string(not(containsString("secret-project"))))
                .andExpect(content().string(not(containsString("old-article"))));
    }

    @Test
    void robotsReferencesTheAbsolutePublicSitemapUrl() throws Exception {
        mockMvc.perform(get("/robots.txt").with(request -> {
                    request.setScheme("https");
                    request.setServerName("portfolio.example");
                    request.setServerPort(443);
                    request.setSecure(true);
                    return request;
                }))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith(MediaType.TEXT_PLAIN))
                .andExpect(content().string(containsString("User-agent: *")))
                .andExpect(content().string(containsString("Disallow: /api/")))
                .andExpect(content().string(containsString(
                        "Sitemap: https://portfolio.example/sitemap.xml"
                )));
    }
}
