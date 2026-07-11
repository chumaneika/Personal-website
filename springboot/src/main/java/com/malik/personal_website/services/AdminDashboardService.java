package com.malik.personal_website.services;

import com.malik.personal_website.dto.DashboardSummaryResponse;
import com.malik.personal_website.enums.ContactMessageStatus;
import com.malik.personal_website.enums.PublicationStatus;
import com.malik.personal_website.repositories.ContactMessageRepository;
import com.malik.personal_website.repositories.ProjectRepository;
import com.malik.personal_website.repositories.SkillRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AdminDashboardService {

    private final ProjectRepository projectRepository;
    private final SkillRepository skillRepository;
    private final ContactMessageRepository contactMessageRepository;

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getSummary() {
        return new DashboardSummaryResponse(
                projectRepository.count(),
                projectRepository.countByStatus(PublicationStatus.DRAFT),
                projectRepository.countByStatus(PublicationStatus.PUBLISHED),
                projectRepository.countByStatus(PublicationStatus.ARCHIVED),
                skillRepository.count(),
                skillRepository.countByVisibleTrue(),
                skillRepository.countByVisibleFalse(),
                contactMessageRepository.count(),
                contactMessageRepository.countByStatus(ContactMessageStatus.NEW),
                contactMessageRepository.countByStatus(ContactMessageStatus.READ),
                contactMessageRepository.countByStatus(ContactMessageStatus.ARCHIVED)
        );
    }
}
