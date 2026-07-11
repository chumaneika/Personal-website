package com.malik.personal_website.dto.response;

import com.malik.personal_website.enums.ContactMessageStatus;
import java.time.Instant;

public record ContactMessageResponse(
        Long id,
        String senderName,
        String senderEmail,
        String message,
        ContactMessageStatus status,
        Instant createdAt,
        Instant updatedAt
) {
}
