package com.malik.personal_website.dto;

import com.malik.personal_website.enums.PublicationStatus;
import jakarta.validation.constraints.NotNull;

public record ProjectStatusUpdateRequest(
        @NotNull PublicationStatus status
) {
}
