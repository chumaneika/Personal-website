package com.malik.personal_website.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ContactMessageRequest(
        @NotBlank @Size(max = 120) String senderName,
        @NotBlank @Email @Size(max = 254) String senderEmail,
        @NotBlank @Size(max = 5000) String message
) {
}
