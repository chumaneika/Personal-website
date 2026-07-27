package com.malik.personal_website.events;

import com.malik.personal_website.entities.ContactMessageEntity;
import java.time.Instant;

public record ContactMessageCreatedEvent(
        Long id,
        String senderName,
        String senderEmail,
        String message,
        Instant createdAt
) {

    public static ContactMessageCreatedEvent from(ContactMessageEntity message) {
        return new ContactMessageCreatedEvent(
                message.getId(),
                message.getSenderName(),
                message.getSenderEmail(),
                message.getMessage(),
                message.getCreatedAt()
        );
    }
}
