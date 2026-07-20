package com.malik.personal_website.dto.request;

import com.malik.personal_website.enums.PublicationStatus;
import jakarta.validation.constraints.NotNull;

public record ArticleStatusUpdateRequest(
        @NotNull PublicationStatus status
) {
}
