package com.malik.personal_website.dto.request;

import com.malik.personal_website.enums.PublicationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record ArticleRequest(
        @NotBlank @Size(max = 200) String title,
        @NotBlank @Size(max = 180) @Pattern(regexp = "^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$") String slug,
        @Size(max = 1000) String summary,
        @NotBlank @Size(max = 100000) String content,
        @Size(max = 512) String coverImageUrl,
        PublicationStatus status
) {
}
