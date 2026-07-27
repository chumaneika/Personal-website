package com.malik.personal_website.dto.response;

public record CsrfTokenResponse(
        String token,
        String headerName
) {
}
