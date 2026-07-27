package com.malik.personal_website.controllers;

import com.malik.personal_website.dto.request.ContactMessageRequest;
import com.malik.personal_website.dto.response.ContactMessageResponse;
import com.malik.personal_website.dto.mapper.ContactMessageMapper;
import com.malik.personal_website.services.ContactMessageService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/contact-messages")
public class PublicContactMessageController {

    private final ContactMessageService contactMessageService;
    private final ContactMessageMapper contactMessageMapper;

    @PostMapping
    public ResponseEntity<ContactMessageResponse> createMessage(
            @Valid @RequestBody ContactMessageRequest request,
            HttpServletRequest servletRequest
    ) {
        return contactMessageService.createMessage(request, servletRequest.getRemoteAddr())
                .map(message -> ResponseEntity
                        .status(HttpStatus.CREATED)
                        .body(contactMessageMapper.toResponse(message)))
                .orElseGet(() -> ResponseEntity.accepted().build());
    }
}
