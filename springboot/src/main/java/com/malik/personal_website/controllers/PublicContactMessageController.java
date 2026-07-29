package com.malik.personal_website.controllers;

import com.malik.personal_website.dto.request.ContactMessageRequest;
import com.malik.personal_website.dto.response.ErrorResponse;
import com.malik.personal_website.dto.response.ContactMessageResponse;
import com.malik.personal_website.dto.mapper.ContactMessageMapper;
import com.malik.personal_website.services.ContactMessageService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(name = "Public contact", description = "Публичная отправка контактной формы.")
public class PublicContactMessageController {

    private final ContactMessageService contactMessageService;
    private final ContactMessageMapper contactMessageMapper;

    @PostMapping
    @Operation(
            summary = "Отправить контактное сообщение",
            description = "CSRF не требуется. Honeypot-запрос возвращает 202 без сохранения сообщения."
    )
    @ApiResponses({
            @ApiResponse(responseCode = "201", description = "Сообщение сохранено"),
            @ApiResponse(responseCode = "202", description = "Honeypot-запрос принят без сохранения"),
            @ApiResponse(
                    responseCode = "400",
                    description = "Ошибка валидации или JSON",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "413",
                    description = "Запрос превышает разрешённый размер",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "429",
                    description = "Превышен rate limit; ответ содержит Retry-After",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            )
    })
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
