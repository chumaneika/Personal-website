package com.malik.personal_website.controllers;

import com.malik.personal_website.dto.EnumValuesResponse;
import com.malik.personal_website.dto.SkillCategoryResponse;
import com.malik.personal_website.enums.ContactMessageStatus;
import com.malik.personal_website.enums.PublicationStatus;
import com.malik.personal_website.enums.SkillLevel;
import com.malik.personal_website.services.SkillService;
import java.util.Arrays;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/meta")
public class PublicMetadataController {

    private final SkillService skillService;

    @GetMapping("/enums")
    public EnumValuesResponse getEnums() {
        return new EnumValuesResponse(
                enumNames(PublicationStatus.values()),
                skillService.getCategories()
                        .stream()
                        .map(SkillCategoryResponse::from)
                        .toList(),
                enumNames(SkillLevel.values()),
                enumNames(ContactMessageStatus.values())
        );
    }

    private <T extends Enum<T>> List<String> enumNames(T[] values) {
        return Arrays.stream(values)
                .map(Enum::name)
                .toList();
    }
}
