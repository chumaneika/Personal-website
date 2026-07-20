package com.malik.personal_website.controllers;

import com.malik.personal_website.dto.mapper.ContactMessageMapper;
import com.malik.personal_website.dto.request.ContactMessageStatusUpdateRequest;
import com.malik.personal_website.dto.response.ContactMessageResponse;
import com.malik.personal_website.dto.response.PageResponse;
import com.malik.personal_website.enums.ContactMessageStatus;
import com.malik.personal_website.services.ContactMessageService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@Validated
@RequestMapping("/api/admin/contact-messages")
public class AdminContactMessageController {

    private final ContactMessageService contactMessageService;
    private final ContactMessageMapper contactMessageMapper;

    @GetMapping
    public PageResponse<ContactMessageResponse> getMessages(
            @RequestParam(required = false) ContactMessageStatus status,
            @RequestParam(defaultValue = "0") @Min(0) int page,
            @RequestParam(defaultValue = "20") @Min(1) @Max(100) int size
    ) {
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<ContactMessageResponse> messages = contactMessageService.getAdminMessages(status, pageRequest)
                .map(contactMessageMapper::toResponse);
        return PageResponse.from(messages);
    }

    @GetMapping("/{id}")
    public ContactMessageResponse getMessage(@PathVariable Long id) {
        return contactMessageMapper.toResponse(contactMessageService.getAdminMessage(id));
    }

    @PatchMapping("/{id}/status")
    public ContactMessageResponse updateStatus(
            @PathVariable Long id,
            @Valid @RequestBody ContactMessageStatusUpdateRequest request
    ) {
        return contactMessageMapper.toResponse(contactMessageService.updateStatus(id, request.status()));
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteMessage(@PathVariable Long id) {
        contactMessageService.deleteMessage(id);
    }
}
