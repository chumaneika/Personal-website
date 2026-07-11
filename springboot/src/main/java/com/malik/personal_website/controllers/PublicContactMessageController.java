package com.malik.personal_website.controllers;

import com.malik.personal_website.dto.ContactMessageRequest;
import com.malik.personal_website.dto.ContactMessageResponse;
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

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ContactMessageResponse createMessage(@Valid @RequestBody ContactMessageRequest request) {
        return ContactMessageResponse.from(contactMessageService.createMessage(request));
    }
}
