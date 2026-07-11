package com.malik.personal_website.dto;

import com.malik.personal_website.entities.ContactMessageEntity;
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

    public static ContactMessageResponse from(ContactMessageEntity message) {
        return new ContactMessageResponse(
                message.getId(),
                message.getSenderName(),
                message.getSenderEmail(),
                message.getMessage(),
                message.getStatus(),
                message.getCreatedAt(),
                message.getUpdatedAt()
        );
    }
}
