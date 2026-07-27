package com.malik.personal_website.services;

import com.malik.personal_website.dto.request.ContactMessageRequest;
import com.malik.personal_website.entities.ContactMessageEntity;
import com.malik.personal_website.enums.ContactMessageStatus;
import com.malik.personal_website.events.ContactMessageCreatedEvent;
import com.malik.personal_website.exceptions.ResourceNotFoundException;
import com.malik.personal_website.repositories.ContactMessageRepository;
import java.time.Duration;
import java.time.Instant;
import java.util.Locale;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ContactMessageService {

    private final ContactMessageRepository contactMessageRepository;
    private final ContactSubmissionRateLimiter contactSubmissionRateLimiter;
    private final ApplicationEventPublisher eventPublisher;

    @Value("${app.contact.duplicate-window:24h}")
    private Duration duplicateWindow;

    @Transactional
    public Optional<ContactMessageEntity> createMessage(
            ContactMessageRequest request,
            String clientAddress
    ) {
        contactSubmissionRateLimiter.checkAndRecord(clientAddress);

        if (request.website() != null && !request.website().isBlank()) {
            return Optional.empty();
        }

        String normalizedEmail = request.senderEmail().trim().toLowerCase(Locale.ROOT);
        String normalizedMessage = request.message().trim();
        if (contactMessageRepository.existsBySenderEmailAndMessageAndCreatedAtAfter(
                normalizedEmail,
                normalizedMessage,
                Instant.now().minus(duplicateWindow)
        )) {
            return Optional.empty();
        }

        ContactMessageEntity message = new ContactMessageEntity();
        message.setSenderName(request.senderName());
        message.setSenderEmail(normalizedEmail);
        message.setMessage(normalizedMessage);
        message.setStatus(ContactMessageStatus.NEW);

        ContactMessageEntity savedMessage = contactMessageRepository.save(message);
        eventPublisher.publishEvent(ContactMessageCreatedEvent.from(savedMessage));
        return Optional.of(savedMessage);
    }

    @Transactional(readOnly = true)
    public Page<ContactMessageEntity> getAdminMessages(ContactMessageStatus status, Pageable pageable) {
        if (status == null) {
            return contactMessageRepository.findAll(pageable);
        }
        return contactMessageRepository.findByStatus(status, pageable);
    }

    @Transactional(readOnly = true)
    public ContactMessageEntity getAdminMessage(Long id) {
        return findMessage(id);
    }

    @Transactional
    public ContactMessageEntity updateStatus(Long id, ContactMessageStatus status) {
        ContactMessageEntity message = findMessage(id);
        message.setStatus(status);
        return contactMessageRepository.save(message);
    }

    @Transactional
    public void deleteMessage(Long id) {
        contactMessageRepository.delete(findMessage(id));
    }

    private ContactMessageEntity findMessage(Long id) {
        return contactMessageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact message not found: " + id));
    }
}
