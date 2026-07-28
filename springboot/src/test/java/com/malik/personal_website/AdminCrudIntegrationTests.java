package com.malik.personal_website;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
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
import com.malik.personal_website.repositories.ProfileRepository;
import com.malik.personal_website.repositories.ProjectRepository;
import com.malik.personal_website.repositories.SkillCategoryRepository;
import com.malik.personal_website.repositories.SkillRepository;
import com.malik.personal_website.repositories.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockHttpSession;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AdminCrudIntegrationTests {

    private static final String ADMIN_EMAIL = "crud-admin@example.com";
    private static final String ADMIN_PASSWORD = "test-password";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ProfileRepository profileRepository;

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private SkillRepository skillRepository;

    @Autowired
    private SkillCategoryRepository skillCategoryRepository;

    @Autowired
    private UserRepository userRepository;

    private MockHttpSession adminSession;

    @BeforeEach
    void setUp() throws Exception {
        skillRepository.deleteAll();
        skillCategoryRepository.deleteAll();
        projectRepository.deleteAll();
        profileRepository.deleteAll();
        userRepository.deleteAll();

        UserEntity admin = new UserEntity();
        admin.setEmail(ADMIN_EMAIL);
        admin.setPasswordHash(passwordEncoder.encode(ADMIN_PASSWORD));
        admin.setRole(UserRole.ADMIN);
        admin.setEnabled(true);
        userRepository.saveAndFlush(admin);

        MvcResult login = mockMvc.perform(post("/api/auth/login")
                        .with(csrf())
                        .with(request -> {
                            request.setRemoteAddr("192.0.2.10");
                            return request;
                        })
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {
                                  "email": "%s",
                                  "password": "%s"
                                }
                                """.formatted(ADMIN_EMAIL, ADMIN_PASSWORD)))
                .andExpect(status().isOk())
                .andReturn();
        adminSession = (MockHttpSession) login.getRequest().getSession(false);
    }

    @Test
    void projectEndpointsSupportCrudStatusFilteringAndPublicVisibility() throws Exception {
        MvcResult created = mockMvc.perform(post("/api/admin/projects")
                        .session(adminSession)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(projectPayload(
                                "Payments API",
                                "payments-api",
                                "DRAFT",
                                "2025-01-10",
                                "2025-06-30"
                        )))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.slug").value("payments-api"))
                .andExpect(jsonPath("$.coverImageAvifUrl").value("https://cdn.example/project.avif"))
                .andExpect(jsonPath("$.coverImageWebpUrl").value("https://cdn.example/project.webp"))
                .andExpect(jsonPath("$.status").value("DRAFT"))
                .andReturn();
        long projectId = responseId(created);

        mockMvc.perform(get("/api/admin/projects/{id}", projectId).session(adminSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Payments API"));
        mockMvc.perform(get("/api/admin/projects")
                        .session(adminSession)
                        .param("status", "DRAFT"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(projectId));
        mockMvc.perform(get("/api/projects"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        mockMvc.perform(put("/api/admin/projects/{id}", projectId)
                        .session(adminSession)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(projectPayload(
                                "Payments Platform",
                                "payments-platform",
                                "DRAFT",
                                "2025-01-10",
                                "2025-07-15"
                        )))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Payments Platform"))
                .andExpect(jsonPath("$.slug").value("payments-platform"));

        mockMvc.perform(patch("/api/admin/projects/{id}/status", projectId)
                        .session(adminSession)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"status\":\"PUBLISHED\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("PUBLISHED"));
        mockMvc.perform(get("/api/projects/payments-platform"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.id").value(projectId));

        mockMvc.perform(delete("/api/admin/projects/{id}", projectId)
                        .session(adminSession)
                        .with(csrf()))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/admin/projects/{id}", projectId).session(adminSession))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/api/projects/payments-platform"))
                .andExpect(status().isNotFound());
    }

    @Test
    void profileEndpointsSupportCreateReadAndUpdateWithoutDuplicates() throws Exception {
        mockMvc.perform(get("/api/admin/profile").session(adminSession))
                .andExpect(status().isNotFound());
        mockMvc.perform(get("/api/profile"))
                .andExpect(status().isNotFound());

        mockMvc.perform(put("/api/admin/profile")
                        .session(adminSession)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(profilePayload(
                                "Malik",
                                "Alikberov",
                                "Java Backend Developer",
                                "Moscow"
                        )))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.firstName").value("Malik"))
                .andExpect(jsonPath("$.avatarAvifUrl").value("https://cdn.example/avatar.avif"))
                .andExpect(jsonPath("$.avatarWebpUrl").value("https://cdn.example/avatar.webp"))
                .andExpect(jsonPath("$.location").value("Moscow"));
        mockMvc.perform(get("/api/profile"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.headline").value("Java Backend Developer"));

        mockMvc.perform(put("/api/admin/profile")
                        .session(adminSession)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(profilePayload(
                                "Malik",
                                "Alikberov",
                                "Senior Java Backend Developer",
                                "Saint Petersburg"
                        )))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.headline").value("Senior Java Backend Developer"))
                .andExpect(jsonPath("$.location").value("Saint Petersburg"));

        assertEquals(1, profileRepository.count());
        mockMvc.perform(get("/api/admin/profile").session(adminSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.headline").value("Senior Java Backend Developer"));
    }

    @Test
    void skillEndpointsSupportCrudVisibilityAndCategoryChanges() throws Exception {
        long backendCategoryId = createCategory("Backend");
        long databaseCategoryId = createCategory("Databases");

        MvcResult created = mockMvc.perform(post("/api/admin/skills")
                        .session(adminSession)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(skillPayload("Spring Boot", backendCategoryId, "ADVANCED", 2, true)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.category.id").value(backendCategoryId))
                .andExpect(jsonPath("$.visible").value(true))
                .andReturn();
        long skillId = responseId(created);

        mockMvc.perform(get("/api/admin/skills/{id}", skillId).session(adminSession))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Spring Boot"));
        mockMvc.perform(get("/api/skills").param("categoryId", String.valueOf(backendCategoryId)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].id").value(skillId));

        mockMvc.perform(put("/api/admin/skills/{id}", skillId)
                        .session(adminSession)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(skillPayload("PostgreSQL", databaseCategoryId, "ADVANCED", 1, true)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("PostgreSQL"))
                .andExpect(jsonPath("$.category.id").value(databaseCategoryId))
                .andExpect(jsonPath("$.sortOrder").value(1));

        mockMvc.perform(patch("/api/admin/skills/{id}/visibility", skillId)
                        .session(adminSession)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"visible\":false}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.visible").value(false));
        mockMvc.perform(get("/api/skills"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(0));

        mockMvc.perform(delete("/api/admin/skills/{id}", skillId)
                        .session(adminSession)
                        .with(csrf()))
                .andExpect(status().isNoContent());
        mockMvc.perform(get("/api/admin/skills/{id}", skillId).session(adminSession))
                .andExpect(status().isNotFound());
    }

    @Test
    void projectDatesRejectCompletionBeforeStartOnCreateAndUpdate() throws Exception {
        mockMvc.perform(post("/api/admin/projects")
                        .session(adminSession)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(projectPayload(
                                "Invalid timeline",
                                "invalid-timeline",
                                "DRAFT",
                                "2026-08-20",
                                "2026-08-19"
                        )))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").value("completedAt must not be before startedAt"));
        assertEquals(0, projectRepository.count());

        MvcResult created = mockMvc.perform(post("/api/admin/projects")
                        .session(adminSession)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(projectPayload(
                                "Valid timeline",
                                "valid-timeline",
                                "DRAFT",
                                "2026-01-01",
                                "2026-06-01"
                        )))
                .andExpect(status().isCreated())
                .andReturn();

        mockMvc.perform(put("/api/admin/projects/{id}", responseId(created))
                        .session(adminSession)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(projectPayload(
                                "Invalid updated timeline",
                                "valid-timeline",
                                "DRAFT",
                                "2026-07-01",
                                "2026-06-30"
                        )))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.status").value(400));
    }

    @Test
    void projectSlugConflictsAreRejectedOnCreateAndUpdate() throws Exception {
        mockMvc.perform(post("/api/admin/projects")
                        .session(adminSession)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(projectPayload(
                                "First project",
                                "Shared-Slug",
                                "DRAFT",
                                null,
                                null
                        )))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.slug").value("shared-slug"));

        mockMvc.perform(post("/api/admin/projects")
                        .session(adminSession)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(projectPayload(
                                "Duplicate project",
                                "shared-slug",
                                "DRAFT",
                                null,
                                null
                        )))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.message").value("Project slug already exists: shared-slug"));

        MvcResult second = mockMvc.perform(post("/api/admin/projects")
                        .session(adminSession)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(projectPayload(
                                "Second project",
                                "second-project",
                                "DRAFT",
                                null,
                                null
                        )))
                .andExpect(status().isCreated())
                .andReturn();

        mockMvc.perform(put("/api/admin/projects/{id}", responseId(second))
                        .session(adminSession)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(projectPayload(
                                "Second project",
                                "shared-slug",
                                "DRAFT",
                                null,
                                null
                        )))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.status").value(409));
    }

    private long createCategory(String name) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/admin/skill-categories")
                        .session(adminSession)
                        .with(csrf())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"name\":\"%s\"}".formatted(name)))
                .andExpect(status().isCreated())
                .andReturn();
        return responseId(result);
    }

    private long responseId(MvcResult result) throws Exception {
        JsonNode response = objectMapper.readTree(result.getResponse().getContentAsString());
        return response.path("id").asLong();
    }

    private String projectPayload(
            String title,
            String slug,
            String status,
            String startedAt,
            String completedAt
    ) {
        return """
                {
                  "title": "%s",
                  "slug": "%s",
                  "shortDescription": "Short description",
                  "fullDescription": "Full description",
                  "technologyStack": "Java, Spring Boot",
                  "coverImageUrl": "https://cdn.example/project.jpg",
                  "coverImageAvifUrl": "https://cdn.example/project.avif",
                  "coverImageWebpUrl": "https://cdn.example/project.webp",
                  "status": "%s",
                  "startedAt": %s,
                  "completedAt": %s
                }
                """.formatted(
                title,
                slug,
                status,
                jsonString(startedAt),
                jsonString(completedAt)
        );
    }

    private String profilePayload(String firstName, String lastName, String headline, String location) {
        return """
                {
                  "firstName": "%s",
                  "lastName": "%s",
                  "headline": "%s",
                  "shortBio": "Backend engineer",
                  "location": "%s",
                  "email": "malik@example.com",
                  "githubUrl": "https://github.com/example",
                  "avatarUrl": "https://cdn.example/avatar.jpg",
                  "avatarAvifUrl": "https://cdn.example/avatar.avif",
                  "avatarWebpUrl": "https://cdn.example/avatar.webp"
                }
                """.formatted(firstName, lastName, headline, location);
    }

    private String skillPayload(
            String name,
            long categoryId,
            String level,
            int sortOrder,
            boolean visible
    ) {
        return """
                {
                  "name": "%s",
                  "categoryId": %d,
                  "level": "%s",
                  "sortOrder": %d,
                  "visible": %s
                }
                """.formatted(name, categoryId, level, sortOrder, visible);
    }

    private String jsonString(String value) {
        return value == null ? "null" : "\"%s\"".formatted(value);
    }
}
