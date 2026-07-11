package com.malik.personal_website.dto;

import com.malik.personal_website.enums.PublicationStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record ProjectRequest(
        @NotBlank @Size(max = 200) String title,
        @NotBlank @Size(max = 180) @Pattern(regexp = "^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$") String slug,
        String shortDescription,
        String fullDescription,
        String problemDescription,
        String solutionDescription,
        String technologyStack,
        @Size(max = 512) String githubUrl,
        @Size(max = 512) String demoUrl,
        @Size(max = 512) String coverImageUrl,
        PublicationStatus status,
        LocalDate startedAt,
        LocalDate completedAt
) {
}
