package com.malik.personal_website.controllers;

import com.malik.personal_website.config.OpenApiConfig;
import com.malik.personal_website.dto.mapper.SkillCategoryMapper;
import com.malik.personal_website.dto.response.EnumValuesResponse;
import com.malik.personal_website.enums.ContactMessageStatus;
import com.malik.personal_website.enums.PublicationStatus;
import com.malik.personal_website.enums.SkillLevel;
import com.malik.personal_website.services.SkillCategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Arrays;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin/meta")
@Tag(name = "Admin metadata", description = "Enum-значения и справочники для admin UI.")
@SecurityRequirement(name = OpenApiConfig.SESSION_COOKIE_SCHEME)
public class AdminMetadataController {

    private final SkillCategoryService skillCategoryService;
    private final SkillCategoryMapper skillCategoryMapper;

    @GetMapping("/enums")
    @Operation(summary = "Получить enum-значения и категории навыков")
    public EnumValuesResponse getEnums() {
        return new EnumValuesResponse(
                enumNames(PublicationStatus.values()),
                skillCategoryMapper.toResponses(skillCategoryService.getCategories()),
                enumNames(SkillLevel.values()),
                enumNames(ContactMessageStatus.values())
        );
    }

    private <T extends Enum<T>> List<String> enumNames(T[] values) {
        return Arrays.stream(values).map(Enum::name).toList();
    }
}
