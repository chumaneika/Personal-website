package com.malik.personal_website.controllers;

import com.malik.personal_website.dto.request.ContactMessageRequest;
import com.malik.personal_website.dto.response.ContactMessageResponse;
import com.malik.personal_website.dto.mapper.ContactMessageMapper;
import com.malik.personal_website.services.ContactMessageService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/contact-messages")
public class PublicContactMessageController {

    private final ContactMessageService contactMessageService;
    private final ContactMessageMapper contactMessageMapper;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ContactMessageResponse createMessage(@Valid @RequestBody ContactMessageRequest request) {
        return contactMessageMapper.toResponse(contactMessageService.createMessage(request));
    }
}
