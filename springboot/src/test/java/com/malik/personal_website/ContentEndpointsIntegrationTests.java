package com.malik.personal_website;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.malik.personal_website.entities.UserEntity;
import com.malik.personal_website.enums.UserRole;
import com.malik.personal_website.repositories.ArticleRepository;
import com.malik.personal_website.repositories.ContactMessageRepository;
import com.malik.personal_website.repositories.SkillCategoryRepository;
import com.malik.personal_website.repositories.SkillRepository;
import com.malik.personal_website.repositories.UserRepository;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ContentEndpointsIntegrationTests {

    private static final String ADMIN_EMAIL = "admin@example.com";
    private static final String ADMIN_PASSWORD = "test-password";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ArticleRepository articleRepository;

    @Autowired
    private ContactMessageRepository contactMessageRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private SkillCategoryRepository skillCategoryRepository;

    private String authorization;

    @BeforeEach
    void setUp() {
        skillRepository.deleteAll();
        skillCategoryRepository.deleteAll();
        articleRepository.deleteAll();
        contactMessageRepository.deleteAll();
        userRepository.deleteAll();

        UserEntity admin = new UserEntity();
        admin.setEmail(ADMIN_EMAIL);
        admin.setPasswordHash(passwordEncoder.encode(ADMIN_PASSWORD));
        admin.setRole(UserRole.ADMIN);
        admin.setEnabled(true);
        userRepository.save(admin);

        String credentials = ADMIN_EMAIL + ":" + ADMIN_PASSWORD;
        authorization = "Basic " + Base64.getEncoder()
                .encodeToString(credentials.getBytes(StandardCharsets.UTF_8));
    }

    @Test
    void skillCategoryEndpointsSupportCrudAndProtectReferencedCategories() throws Exception {
        mockMvc.perform(post("/api/admin/skill-categories")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Backend\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));

        MvcResult created = mockMvc.perform(post("/api/admin/skill-categories")
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Backend\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Backend"))
                .andReturn();
        long categoryId = responseId(created);

        mockMvc.perform(post("/api/admin/skill-categories")
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"backend\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));

        mockMvc.perform(get("/api/skill-categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(categoryId));

        mockMvc.perform(put("/api/admin/skill-categories/{id}", categoryId)
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Core backend\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Core backend"));

        MvcResult skill = mockMvc.perform(post("/api/admin/skills")
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "name": "Spring Boot",
                                  "categoryId": %d,
                                  "level": "ADVANCED"
                                }
                                """.formatted(categoryId)))
                .andExpect(status().isCreated())
                .andReturn();

        mockMvc.perform(delete("/api/admin/skill-categories/{id}", categoryId)
                        .header("Authorization", authorization))
                .andExpect(status().isConflict());

        mockMvc.perform(delete("/api/admin/skills/{id}", responseId(skill))
                        .header("Authorization", authorization))
                .andExpect(status().isNoContent());
        mockMvc.perform(delete("/api/admin/skill-categories/{id}", categoryId)
                        .header("Authorization", authorization))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/admin/skill-categories/{id}", categoryId)
                        .header("Authorization", authorization))
                .andExpect(status().isNotFound());
    }

    @Test
    void articleEndpointsExposeOnlyPublishedContentAndHandleConflicts() throws Exception {
        String draftPayload = """
                {
                  "title": "Spring transactions",
                  "slug": "spring-transactions",
                  "summary": "Transaction boundaries explained",
                  "content": "Article body",
                  "status": "DRAFT"
                }
                """;
        MvcResult created = mockMvc.perform(post("/api/admin/articles")
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(draftPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andReturn();
        long articleId = responseId(created);

        mockMvc.perform(get("/api/admin/articles/{id}", articleId)
                        .header("Authorization", authorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Spring transactions"));
        mockMvc.perform(get("/api/admin/articles")
                        .header("Authorization", authorization)
                        .param("status", "DRAFT"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(articleId));

        mockMvc.perform(put("/api/admin/articles/{id}", articleId)
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "title": "Spring transaction boundaries",
                                  "slug": "spring-transactions",
                                  "summary": "Updated summary",
                                  "content": "Updated article body",
                                  "status": "DRAFT"
                                }
                                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Spring transaction boundaries"));

        mockMvc.perform(get("/api/articles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));
        mockMvc.perform(get("/api/articles/spring-transactions"))
                .andExpect(status().isNotFound());

        mockMvc.perform(patch("/api/admin/articles/{id}/status", articleId)
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"PUBLISHED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PUBLISHED"));

        mockMvc.perform(get("/api/articles"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].slug").value("spring-transactions"));
        mockMvc.perform(get("/api/articles/spring-transactions"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").value("Updated article body"));

        mockMvc.perform(post("/api/admin/articles")
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(draftPayload))
                .andExpect(status().isConflict());

        mockMvc.perform(patch("/api/admin/articles/{id}/status", articleId)
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"UNKNOWN\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));

        mockMvc.perform(delete("/api/admin/articles/{id}", articleId)
                        .header("Authorization", authorization))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/admin/articles/{id}", articleId)
                        .header("Authorization", authorization))
                .andExpect(status().isNotFound());
    }

    @Test
    void contactMessageEndpointsSupportPaginationStatusAndDeletion() throws Exception {
        MvcResult created = mockMvc.perform(post("/api/contact-messages")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "senderName": "Visitor",
                                  "senderEmail": "visitor@example.com",
                                  "message": "Hello"
                                }
                                """))
                .andExpect(status().isCreated())
                .andReturn();
        long messageId = responseId(created);

        mockMvc.perform(get("/api/admin/contact-messages"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/admin/contact-messages")
                        .header("Authorization", authorization)
                        .param("page", "0")
                        .param("size", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(messageId))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.first").value(true));

        mockMvc.perform(get("/api/admin/contact-messages")
                        .header("Authorization", authorization)
                        .param("size", "0"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));

        mockMvc.perform(patch("/api/admin/contact-messages/{id}/status", messageId)
                        .header("Authorization", authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"READ\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("READ"));

        mockMvc.perform(delete("/api/admin/contact-messages/{id}", messageId)
                        .header("Authorization", authorization))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/admin/contact-messages/{id}", messageId)
                        .header("Authorization", authorization))
                .andExpect(status().isNotFound());
    }

    @Test
    void metadataSeparatesPublicAndAdminContracts() throws Exception {
        mockMvc.perform(get("/api/meta/enums"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/admin/meta/enums"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/admin/meta/enums")
                        .header("Authorization", authorization))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.publicationStatuses").isArray())
                .andExpect(jsonPath("$.contactMessageStatuses").isArray());
        mockMvc.perform(get("/api/skill-categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray());
    }

    private long responseId(MvcResult result) throws Exception {
        JsonNode response = objectMapper.readTree(result.getResponse().getContentAsString());
        return response.path("id").asLong();
    }
}
