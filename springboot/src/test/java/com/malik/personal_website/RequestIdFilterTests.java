package com.malik.personal_website;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

import com.malik.personal_website.config.RequestIdFilter;
import jakarta.servlet.ServletException;
import java.util.UUID;
import java.util.stream.Stream;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.MethodSource;
import org.junit.jupiter.params.provider.NullSource;
import org.slf4j.MDC;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;

class RequestIdFilterTests {

    private static final String HEADER_NAME = "X-Request-ID";
    private static final String MDC_KEY = "request_id";

    private final RequestIdFilter filter = new RequestIdFilter();

    @AfterEach
    void clearMdc() {
        MDC.clear();
    }

    @Test
    void acceptsASafeRequestIdAndMakesItAvailableDuringTheRequest() throws Exception {
        String requestId = "edge.AZaz09_-request";
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/health");
        request.addHeader(HEADER_NAME, requestId);
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, (servletRequest, servletResponse) ->
                assertThat(MDC.get(MDC_KEY)).isEqualTo(requestId)
        );

        assertThat(response.getHeader(HEADER_NAME)).isEqualTo(requestId);
        assertThat(MDC.get(MDC_KEY)).isNull();
    }

    @ParameterizedTest
    @NullSource
    @MethodSource("invalidRequestIds")
    void replacesMissingOrUnsafeRequestIdsWithAUuid(String incomingRequestId) throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/health");
        if (incomingRequestId != null) {
            request.addHeader(HEADER_NAME, incomingRequestId);
        }
        MockHttpServletResponse response = new MockHttpServletResponse();

        filter.doFilter(request, response, (servletRequest, servletResponse) ->
                assertThat(MDC.get(MDC_KEY)).isNotBlank()
        );

        String generatedRequestId = response.getHeader(HEADER_NAME);
        assertThat(generatedRequestId).isNotEqualTo(incomingRequestId);
        assertThat(UUID.fromString(generatedRequestId).toString()).isEqualTo(generatedRequestId);
        assertThat(MDC.get(MDC_KEY)).isNull();
    }

    @Test
    void clearsMdcWhenTheRequestFails() {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/health");
        MockHttpServletResponse response = new MockHttpServletResponse();

        assertThatThrownBy(() -> filter.doFilter(request, response, (servletRequest, servletResponse) -> {
            assertThat(MDC.get(MDC_KEY)).isNotBlank();
            throw new ServletException("test failure");
        })).isInstanceOf(ServletException.class);

        assertThat(response.getHeader(HEADER_NAME)).isNotBlank();
        assertThat(MDC.get(MDC_KEY)).isNull();
    }

    private static Stream<String> invalidRequestIds() {
        return Stream.of(
                "",
                "contains spaces",
                "contains/slash",
                "a".repeat(65)
        );
    }
}
