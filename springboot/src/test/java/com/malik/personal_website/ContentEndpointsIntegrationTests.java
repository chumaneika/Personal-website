package com.malik.personal_website;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.malik.personal_website.entities.ContactMessageEntity;
import com.malik.personal_website.entities.UserEntity;
import com.malik.personal_website.enums.ContactMessageStatus;
import com.malik.personal_website.enums.UserRole;
import com.malik.personal_website.repositories.ArticleRepository;
import com.malik.personal_website.repositories.ContactMessageRepository;
import com.malik.personal_website.repositories.SkillCategoryRepository;
import com.malik.personal_website.repositories.SkillRepository;
import com.malik.personal_website.repositories.UserRepository;
import com.malik.personal_website.services.ContactMessageRetentionService;
import java.sql.Timestamp;
import java.time.Instant;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.mock.web.MockHttpSession;

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
    private ContactMessageRetentionService contactMessageRetentionService;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private SkillCategoryRepository skillCategoryRepository;

    private MockHttpSession adminSession;

    @BeforeEach
    void setUp() throws Exception {
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

        MvcResult login = mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "%s",
                                  "password": "%s"
                                }
                                """.formatted(ADMIN_EMAIL, ADMIN_PASSWORD)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(ADMIN_EMAIL))
                .andReturn();
        adminSession = (MockHttpSession) login.getRequest().getSession(false);
    }

    @Test
    void sessionAuthenticationSupportsCsrfAndLogoutAndRejectsBasicAuth() throws Exception {
        mockMvc.perform(get("/api/auth/csrf"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.headerName").value("X-CSRF-TOKEN"));

        mockMvc.perform(get("/api/admin/me")
                        .header("Authorization", "Basic ignored"))
                .andExpect(status().isUnauthorized());

        mockMvc.perform(get("/api/admin/me").session(adminSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(ADMIN_EMAIL));

        mockMvc.perform(post("/api/auth/logout")
                        .session(adminSession)
                        .with(csrf()))
                .andExpect(status().isNoContent());

        assertTrue(adminSession.isInvalid());
    }

    @Test
    void passwordChangeRequiresCsrfAndInvalidatesTheSession() throws Exception {
        String payload = """
                {
                  "currentPassword": "test-password",
                  "newPassword": "new-secure-password-123"
                }
                """;

        mockMvc.perform(post("/api/admin/account/password")
                        .session(adminSession)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").value("Invalid or missing CSRF token"));

        mockMvc.perform(post("/api/admin/account/password")
                        .session(adminSession)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isNoContent());

        assertTrue(adminSession.isInvalid());
    }

    @Test
    void loginAttemptsAreRateLimitedByClientAddress() throws Exception {
        for (int attempt = 0; attempt < 5; attempt++) {
            mockMvc.perform(post("/api/auth/login")
                            .with(csrf())
                            .with(request -> {
                                request.setRemoteAddr("203.0.113.7");
                                return request;
                            })
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {
                                      "email": "admin@example.com",
                                      "password": "incorrect-password"
                                    }
                                    """))
                    .andExpect(status().isUnauthorized());
        }

        mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .with(request -> {
                            request.setRemoteAddr("203.0.113.7");
                            return request;
                        })
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "admin@example.com",
                                  "password": "incorrect-password"
                                }
                                """))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists("Retry-After"));
    }

    @Test
    void skillCategoryEndpointsSupportCrudAndProtectReferencedCategories() throws Exception {
        mockMvc.perform(post("/api/admin/skill-categories")
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Backend\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));

        MvcResult created = mockMvc.perform(post("/api/admin/skill-categories")
                        .session(adminSession)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Backend\"}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Backend"))
                .andReturn();
        long categoryId = responseId(created);

        mockMvc.perform(post("/api/admin/skill-categories")
                        .session(adminSession)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"backend\"}"))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));

        mockMvc.perform(get("/api/skill-categories"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(categoryId));

        mockMvc.perform(put("/api/admin/skill-categories/{id}", categoryId)
                        .session(adminSession)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"Core backend\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Core backend"));

        MvcResult skill = mockMvc.perform(post("/api/admin/skills")
                        .session(adminSession)
                        .with(csrf())
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
                        .session(adminSession)
                        .with(csrf()))
                .andExpect(status().isConflict());

        mockMvc.perform(delete("/api/admin/skills/{id}", responseId(skill))
                        .session(adminSession)
                        .with(csrf()))
                .andExpect(status().isNoContent());
        mockMvc.perform(delete("/api/admin/skill-categories/{id}", categoryId)
                        .session(adminSession)
                        .with(csrf()))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/admin/skill-categories/{id}", categoryId)
                        .session(adminSession))
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
                        .session(adminSession)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(draftPayload))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andReturn();
        long articleId = responseId(created);

        mockMvc.perform(get("/api/admin/articles/{id}", articleId)
                        .session(adminSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Spring transactions"));
        mockMvc.perform(get("/api/admin/articles")
                        .session(adminSession)
                        .param("status", "DRAFT"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(articleId));

        mockMvc.perform(put("/api/admin/articles/{id}", articleId)
                        .session(adminSession)
                        .with(csrf())
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
                        .session(adminSession)
                        .with(csrf())
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
                        .session(adminSession)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(draftPayload))
                .andExpect(status().isConflict());

        mockMvc.perform(patch("/api/admin/articles/{id}/status", articleId)
                        .session(adminSession)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"UNKNOWN\"}"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));

        mockMvc.perform(delete("/api/admin/articles/{id}", articleId)
                        .session(adminSession)
                        .with(csrf()))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/admin/articles/{id}", articleId)
                        .session(adminSession))
                .andExpect(status().isNotFound());
    }

    @Test
    void contactMessageEndpointsSupportPaginationStatusAndDeletion() throws Exception {
        MvcResult created = mockMvc.perform(post("/api/contact-messages")
                        .with(request -> {
                            request.setRemoteAddr("203.0.113.20");
                            return request;
                        })
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
                        .session(adminSession)
                        .param("page", "0")
                        .param("size", "1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content[0].id").value(messageId))
                .andExpect(jsonPath("$.totalElements").value(1))
                .andExpect(jsonPath("$.first").value(true));

        mockMvc.perform(get("/api/admin/contact-messages")
                        .session(adminSession)
                        .param("size", "0"))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));

        mockMvc.perform(patch("/api/admin/contact-messages/{id}/status", messageId)
                        .session(adminSession)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"READ\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("READ"));

        mockMvc.perform(delete("/api/admin/contact-messages/{id}", messageId)
                        .session(adminSession)
                        .with(csrf()))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/admin/contact-messages/{id}", messageId)
                        .session(adminSession))
                .andExpect(status().isNotFound());
    }

    @Test
    void contactFormSilentlyRejectsHoneypotAndRecentDuplicates() throws Exception {
        String acceptedPayload = """
                {
                  "senderName": "Visitor",
                  "senderEmail": "duplicate@example.com",
                  "message": "Please contact me",
                  "website": ""
                }
                """;

        mockMvc.perform(post("/api/contact-messages")
                        .with(request -> {
                            request.setRemoteAddr("203.0.113.21");
                            return request;
                        })
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(acceptedPayload))
                .andExpect(status().isCreated());

        mockMvc.perform(post("/api/contact-messages")
                        .with(request -> {
                            request.setRemoteAddr("203.0.113.21");
                            return request;
                        })
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(acceptedPayload))
                .andExpect(status().isAccepted());

        mockMvc.perform(post("/api/contact-messages")
                        .with(request -> {
                            request.setRemoteAddr("203.0.113.22");
                            return request;
                        })
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "senderName": "Bot",
                                  "senderEmail": "bot@example.com",
                                  "message": "Spam",
                                  "website": "https://spam.example"
                                }
                                """))
                .andExpect(status().isAccepted());

        assertEquals(1, contactMessageRepository.count());
    }

    @Test
    void contactFormRateLimitsSubmissionsByClientAddress() throws Exception {
        for (int attempt = 0; attempt < 5; attempt++) {
            mockMvc.perform(post("/api/contact-messages")
                            .with(request -> {
                                request.setRemoteAddr("203.0.113.23");
                                return request;
                            })
                            .contentType(MediaType.APPLICATION_JSON)
                            .content("""
                                    {
                                      "senderName": "Visitor",
                                      "senderEmail": "visitor-%d@example.com",
                                      "message": "Message %d"
                                    }
                                    """.formatted(attempt, attempt)))
                    .andExpect(status().isCreated());
        }

        mockMvc.perform(post("/api/contact-messages")
                        .with(request -> {
                            request.setRemoteAddr("203.0.113.23");
                            return request;
                        })
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "senderName": "Visitor",
                                  "senderEmail": "blocked@example.com",
                                  "message": "One message too many"
                                }
                                """))
                .andExpect(status().isTooManyRequests())
                .andExpect(header().exists("Retry-After"))
                .andExpect(jsonPath("$.status").value(429));
    }

    @Test
    void contactFormRejectsOversizedRequestBeforeJsonValidation() throws Exception {
        String oversizedPayload = """
                {
                  "senderName": "Visitor",
                  "senderEmail": "large@example.com",
                  "message": "%s"
                }
                """.formatted("x".repeat(17_000));

        mockMvc.perform(post("/api/contact-messages")
                        .with(request -> {
                            request.setRemoteAddr("203.0.113.24");
                            return request;
                        })
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(oversizedPayload))
                .andExpect(status().isPayloadTooLarge())
                .andExpect(jsonPath("$.status").value(413));

        assertEquals(0, contactMessageRepository.count());
    }

    @Test
    void contactMessageRetentionArchivesReadAndDeletesOldArchivedMessages() {
        ContactMessageEntity readMessage = contactMessage(
                "read@example.com",
                "This message has been handled",
                ContactMessageStatus.READ
        );
        ContactMessageEntity archivedMessage = contactMessage(
                "archived@example.com",
                "This archived message has expired",
                ContactMessageStatus.ARCHIVED
        );

        jdbcTemplate.update(
                "UPDATE contact_messages SET created_at = ? WHERE id = ?",
                Timestamp.from(Instant.now().minusSeconds(31L * 24 * 60 * 60)),
                readMessage.getId()
        );
        jdbcTemplate.update(
                "UPDATE contact_messages SET created_at = ? WHERE id = ?",
                Timestamp.from(Instant.now().minusSeconds(366L * 24 * 60 * 60)),
                archivedMessage.getId()
        );

        contactMessageRetentionService.applyRetentionPolicy();

        assertEquals(
                ContactMessageStatus.ARCHIVED,
                contactMessageRepository.findById(readMessage.getId()).orElseThrow().getStatus()
        );
        assertTrue(contactMessageRepository.findById(archivedMessage.getId()).isEmpty());
    }

    @Test
    void metadataSeparatesPublicAndAdminContracts() throws Exception {
        mockMvc.perform(get("/api/meta/enums"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/admin/meta/enums"))
                .andExpect(status().isUnauthorized());
        mockMvc.perform(get("/api/admin/meta/enums")
                        .session(adminSession))
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

    private ContactMessageEntity contactMessage(
            String email,
            String text,
            ContactMessageStatus status
    ) {
        ContactMessageEntity message = new ContactMessageEntity();
        message.setSenderName("Visitor");
        message.setSenderEmail(email);
        message.setMessage(text);
        message.setStatus(status);
        return contactMessageRepository.saveAndFlush(message);
    }
}
