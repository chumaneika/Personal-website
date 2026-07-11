package com.malik.personal_website.services;

import com.malik.personal_website.dto.HomeResponse;
import com.malik.personal_website.dto.ProfileResponse;
import com.malik.personal_website.dto.ProjectSummaryResponse;
import com.malik.personal_website.dto.SkillResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class HomeService {

    private final ProfileService profileService;
    private final ProjectService projectService;
    private final SkillService skillService;

    @Transactional(readOnly = true)
    public HomeResponse getHome() {
        ProfileResponse profile = profileService.findProfile()
                .map(ProfileResponse::from)
                .orElse(null);

        return new HomeResponse(
                profile,
                projectService.getPublishedProjects()
                        .stream()
                        .map(ProjectSummaryResponse::from)
                        .toList(),
                skillService.getVisibleSkills(null)
                        .stream()
                        .map(SkillResponse::from)
                        .toList()
        );
    }
}
