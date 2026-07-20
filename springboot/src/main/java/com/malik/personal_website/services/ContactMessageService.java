package com.malik.personal_website.services;

import com.malik.personal_website.dto.request.ContactMessageRequest;
import com.malik.personal_website.entities.ContactMessageEntity;
import com.malik.personal_website.enums.ContactMessageStatus;
import com.malik.personal_website.exceptions.ResourceNotFoundException;
import com.malik.personal_website.repositories.ContactMessageRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ContactMessageService {

    private final ContactMessageRepository contactMessageRepository;

    @Transactional
    public ContactMessageEntity createMessage(ContactMessageRequest request) {
        ContactMessageEntity message = new ContactMessageEntity();
        message.setSenderName(request.senderName());
        message.setSenderEmail(request.senderEmail());
        message.setMessage(request.message());
        message.setStatus(ContactMessageStatus.NEW);

        return contactMessageRepository.save(message);
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
