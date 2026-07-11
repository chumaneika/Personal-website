package com.malik.personal_website.services;

import com.malik.personal_website.dto.ProjectRequest;
import com.malik.personal_website.entities.ProjectEntity;
import com.malik.personal_website.enums.PublicationStatus;
import com.malik.personal_website.exceptions.ResourceNotFoundException;
import com.malik.personal_website.repositories.ProjectRepository;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;

    @Transactional(readOnly = true)
    public List<ProjectEntity> getPublishedProjects() {
        return projectRepository.findByStatusOrderByCreatedAtDesc(PublicationStatus.PUBLISHED);
    }

    @Transactional(readOnly = true)
    public ProjectEntity getPublishedProjectBySlug(String slug) {
        return projectRepository.findBySlugAndStatus(slug, PublicationStatus.PUBLISHED)
                .orElseThrow(() -> new ResourceNotFoundException("Published project not found: " + slug));
    }

    @Transactional(readOnly = true)
    public List<ProjectEntity> getAdminProjects(PublicationStatus status) {
        if (status == null) {
            return projectRepository.findAllByOrderByCreatedAtDesc();
        }
        return projectRepository.findByStatusOrderByCreatedAtDesc(status);
    }

    @Transactional(readOnly = true)
    public ProjectEntity getAdminProject(Long id) {
        return findProject(id);
    }

    @Transactional
    public ProjectEntity createProject(ProjectRequest request) {
        ProjectEntity project = new ProjectEntity();
        applyRequest(project, request);

        if (projectRepository.existsBySlug(project.getSlug())) {
            throw new IllegalArgumentException("Project slug already exists: " + project.getSlug());
        }

        return projectRepository.save(project);
    }

    @Transactional
    public ProjectEntity updateProject(Long id, ProjectRequest request) {
        ProjectEntity project = findProject(id);
        applyRequest(project, request);

        if (projectRepository.existsBySlugAndIdNot(project.getSlug(), id)) {
            throw new IllegalArgumentException("Project slug already exists: " + project.getSlug());
        }

        return projectRepository.save(project);
    }

    @Transactional
    public ProjectEntity updateStatus(Long id, PublicationStatus status) {
        ProjectEntity project = findProject(id);
        project.setStatus(status);
        return projectRepository.save(project);
    }

    @Transactional
    public void deleteProject(Long id) {
        ProjectEntity project = findProject(id);
        projectRepository.delete(project);
    }

    private ProjectEntity findProject(Long id) {
        return projectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Project not found: " + id));
    }

    private void applyRequest(ProjectEntity project, ProjectRequest request) {
        project.setTitle(request.title());
        project.setSlug(request.slug());
        project.setShortDescription(request.shortDescription());
        project.setFullDescription(request.fullDescription());
        project.setProblemDescription(request.problemDescription());
        project.setSolutionDescription(request.solutionDescription());
        project.setTechnologyStack(request.technologyStack());
        project.setGithubUrl(request.githubUrl());
        project.setDemoUrl(request.demoUrl());
        project.setCoverImageUrl(request.coverImageUrl());
        project.setStatus(request.status() == null ? PublicationStatus.DRAFT : request.status());
        project.setStartedAt(request.startedAt());
        project.setCompletedAt(request.completedAt());
    }
}
