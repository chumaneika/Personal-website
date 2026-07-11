package com.malik.personal_website.controllers;

import com.malik.personal_website.dto.ContactMessageResponse;
import com.malik.personal_website.dto.ContactMessageStatusUpdateRequest;
import com.malik.personal_website.enums.ContactMessageStatus;
import com.malik.personal_website.services.ContactMessageService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/contact-messages")
public class AdminContactMessageController {

    private final ContactMessageService contactMessageService;

    @GetMapping
    public List<ContactMessageResponse> getMessages(@RequestParam(required = false) ContactMessageStatus status) {
        return contactMessageService.getAdminMessages(status)
                .stream()
                .map(ContactMessageResponse::from)
                .toList();
    }

    @GetMapping("/{id}")
    public ContactMessageResponse getMessage(@PathVariable Long id) {
        return ContactMessageResponse.from(contactMessageService.getAdminMessage(id));
    }

    @PatchMapping("/{id}/status")
    public ContactMessageResponse updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody ContactMessageStatusUpdateRequest request
    ) {
        return ContactMessageResponse.from(contactMessageService.updateStatus(id, request.status()));
    }
}
