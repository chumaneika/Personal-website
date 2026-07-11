package com.malik.personal_website.dto;

import com.malik.personal_website.enums.ContactMessageStatus;
import jakarta.validation.constraints.NotNull;

public record ContactMessageStatusUpdateRequest(
        @NotNull ContactMessageStatus status
) {
}
