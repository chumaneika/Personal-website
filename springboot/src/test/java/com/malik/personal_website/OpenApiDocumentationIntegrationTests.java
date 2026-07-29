package com.malik.personal_website;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class OpenApiDocumentationIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Test
    void exposesDocumentedPublicAdminAndAuthenticationOperations() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.info.title").value("Personal Website API"))
                .andExpect(jsonPath("$.info.version").value("1.0.0"))
                .andExpect(jsonPath("$.paths.length()").value(32))
                .andExpect(jsonPath("$['paths']['/api/projects']['get']['summary']")
                        .value("Получить опубликованные проекты"))
                .andExpect(jsonPath("$['paths']['/api/admin/projects']['post']['summary']")
                        .value("Создать проект"))
                .andExpect(jsonPath("$['paths']['/api/auth/login']['post']['summary']")
                        .value("Войти в административную панель"))
                .andExpect(jsonPath("$['paths']['/api/auth/logout']['post']['summary']")
                        .value("Завершить административную сессию"))
                .andExpect(jsonPath("$['paths']['/actuator/health']").doesNotExist());
    }

    @Test
    void documentsSessionCookieCsrfHeaderAndErrorSchema() throws Exception {
        mockMvc.perform(get("/v3/api-docs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.components.securitySchemes.sessionCookie.type").value("apiKey"))
                .andExpect(jsonPath("$.components.securitySchemes.sessionCookie.in").value("cookie"))
                .andExpect(jsonPath("$.components.securitySchemes.sessionCookie.name").value("JSESSIONID"))
                .andExpect(jsonPath("$['paths']['/api/admin/projects']['post']['security'][0].sessionCookie")
                        .isArray())
                .andExpect(jsonPath("$['paths']['/api/admin/projects']['post']['parameters'][0].name")
                        .value("X-CSRF-TOKEN"))
                .andExpect(jsonPath("$['paths']['/api/admin/projects']['post']['responses']['401']")
                        .exists())
                .andExpect(jsonPath("$['paths']['/api/admin/projects']['post']['responses']['403']")
                        .exists())
                .andExpect(jsonPath("$.components.schemas.ErrorResponse.properties.status.type")
                        .value("integer"));
    }

    @Test
    void servesSwaggerUiToAnonymousLocalClients() throws Exception {
        mockMvc.perform(get("/swagger-ui.html"))
                .andExpect(status().is3xxRedirection())
                .andExpect(header().string("Location", containsString("/swagger-ui/index.html")));
    }
}
