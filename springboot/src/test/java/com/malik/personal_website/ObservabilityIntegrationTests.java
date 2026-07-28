package com.malik.personal_website;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import io.sentry.Sentry;
import io.sentry.spring.jakarta.SentryExceptionResolver;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

@SpringBootTest(properties = {
        "management.endpoint.health.show-details=always",
        "app.security.require-https=true",
        "sentry.dsn="
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ObservabilityIntegrationTests {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private MeterRegistry meterRegistry;

    @Autowired
    private SentryExceptionResolver sentryExceptionResolver;

    @Test
    void livenessIsPublicAndDoesNotDependOnTheDatabase() throws Exception {
        mockMvc.perform(get("/actuator/health/liveness"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.components.livenessState.status").value("UP"))
                .andExpect(jsonPath("$.components.db").doesNotExist());
    }

    @Test
    void readinessIsPublicAndChecksTheDatabase() throws Exception {
        mockMvc.perform(get("/actuator/health/readiness"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("UP"))
                .andExpect(jsonPath("$.components.readinessState.status").value("UP"))
                .andExpect(jsonPath("$.components.db.status").value("UP"));
    }

    @Test
    void sentryExceptionMonitoringIsInstalledAndNoOpWithoutADsn() {
        assertThat(sentryExceptionResolver).isNotNull();
        assertThat(Sentry.isEnabled()).isFalse();
    }

    @Test
    void prometheusPublishesHttpRequestDurationAndErrorDimensions() throws Exception {
        mockMvc.perform(get("/api/health").secure(true))
                .andExpect(status().isOk());
        mockMvc.perform(get("/api/admin/me").secure(true))
                .andExpect(status().isUnauthorized());

        Timer successfulRequests = meterRegistry.find("http.server.requests")
                .tag("status", "200")
                .timer();
        Timer failedRequests = meterRegistry.find("http.server.requests")
                .tag("status", "401")
                .timer();

        assertThat(successfulRequests).isNotNull();
        assertThat(successfulRequests.count()).isPositive();
        assertThat(failedRequests).isNotNull();
        assertThat(failedRequests.count()).isPositive();

        mockMvc.perform(get("/actuator/prometheus"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("text/plain"))
                .andExpect(content().string(org.hamcrest.Matchers.containsString(
                        "http_server_requests_seconds_count"
                )));
    }

    @Test
    void httpsRequirementDoesNotRedirectInternalManagementRequests() throws Exception {
        mockMvc.perform(get("/actuator/health/liveness"))
                .andExpect(status().isOk());
        mockMvc.perform(get("/actuator/prometheus"))
                .andExpect(status().isOk());

        mockMvc.perform(get("/api/health"))
                .andExpect(status().isFound());
    }

    @Test
    void requestIdFilterIsAppliedToManagementEndpoints() throws Exception {
        String requestId = "nginx.edge-request_123";

        mockMvc.perform(get("/actuator/health/liveness")
                        .header("X-Request-ID", requestId))
                .andExpect(status().isOk())
                .andExpect(header().string("X-Request-ID", requestId));
    }
}
