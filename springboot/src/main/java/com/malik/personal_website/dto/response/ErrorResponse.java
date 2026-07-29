package com.malik.personal_website.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import java.time.Instant;

@Schema(description = "Единый формат ожидаемых ошибок API.")
public record ErrorResponse(
        @Schema(description = "Время формирования ответа в UTC.", example = "2026-07-29T12:34:56Z")
        Instant timestamp,
        @Schema(description = "HTTP status code.", example = "400")
        int status,
        @Schema(description = "Стандартное имя HTTP status.", example = "Bad Request")
        String error,
        @Schema(description = "Безопасное описание причины ошибки.", example = "title: must not be blank")
        String message,
        @Schema(description = "Путь исходного запроса.", example = "/api/admin/projects")
        String path
) {
}
