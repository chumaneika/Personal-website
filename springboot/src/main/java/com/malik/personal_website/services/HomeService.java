package com.malik.personal_website.services;

import com.malik.personal_website.dto.response.HomeResponse;
import com.malik.personal_website.dto.response.ProfileResponse;
import com.malik.personal_website.dto.mapper.ProfileMapper;
import com.malik.personal_website.dto.mapper.ProjectMapper;
import com.malik.personal_website.dto.mapper.SkillMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class HomeService {

    private final ProfileService profileService;
    private final ProjectService projectService;
    private final SkillService skillService;
    private final ProfileMapper profileMapper;
    private final ProjectMapper projectMapper;
    private final SkillMapper skillMapper;

    @Transactional(readOnly = true)
    public HomeResponse getHome() {
        ProfileResponse profile = profileService.findProfile()
                .map(profileMapper::toResponse)
                .orElse(null);

        return new HomeResponse(
                profile,
                projectMapper.toSummaryResponses(projectService.getPublishedProjects()),
                skillMapper.toResponses(skillService.getVisibleSkills(null))
        );
    }
}
