package com.malik.personal_website.controllers;

import com.malik.personal_website.dto.EnumValuesResponse;
import com.malik.personal_website.enums.ContactMessageStatus;
import com.malik.personal_website.enums.PublicationStatus;
import com.malik.personal_website.enums.SkillCategory;
import com.malik.personal_website.enums.SkillLevel;
import java.util.Arrays;
import java.util.List;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/meta")
public class PublicMetadataController {

    @GetMapping("/enums")
    public EnumValuesResponse getEnums() {
        return new EnumValuesResponse(
                enumNames(PublicationStatus.values()),
                enumNames(SkillCategory.values()),
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
