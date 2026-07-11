package com.malik.personal_website.dto.mapper;

import com.malik.personal_website.dto.response.ContactMessageResponse;
import com.malik.personal_website.entities.ContactMessageEntity;
import java.util.List;
import org.springframework.stereotype.Component;

@Component
public class ContactMessageMapper {

    public ContactMessageResponse toResponse(ContactMessageEntity message) {
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

    public List<ContactMessageResponse> toResponses(List<ContactMessageEntity> messages) {
        return messages.stream()
                .map(this::toResponse)
                .toList();
    }
}
