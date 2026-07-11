import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteProject, fetchProjects, updateProjectStatus } from '../shared/api/projects';
import { queryClient } from '../shared/api/queryClient';
import { getApiErrorMessage } from '../shared/lib/errors';
import { formatDateTime, formatStatus } from '../shared/lib/format';
import { ProjectResponse, PublicationStatus, PUBLICATION_STATUSES } from '../shared/types/api';

type ProjectFilter = PublicationStatus | 'ALL';

function shouldConfirmPublish(project: ProjectResponse) {
  return !project.shortDescription || !project.fullDescription;
}

export function ProjectsPage() {
  const [statusFilter, setStatusFilter] = useState<ProjectFilter>('ALL');
  const projectsQuery = useQuery({
    queryKey: ['projects', statusFilter],
    queryFn: () => fetchProjects(statusFilter === 'ALL' ? undefined : statusFilter),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: PublicationStatus }) => updateProjectStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteProject,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });

  function handleStatusChange(project: ProjectResponse, status: PublicationStatus) {
    if (
      status === 'PUBLISHED' &&
      shouldConfirmPublish(project) &&
      !window.confirm('This project has empty public description fields. Publish it anyway?')
    ) {
      return;
    }

    statusMutation.mutate({ id: project.id, status });
  }

  function handleDelete(project: ProjectResponse) {
    if (window.confirm(`Delete "${project.title}" permanently? Archiving is usually safer.`)) {
      deleteMutation.mutate(project.id);
    }
  }

  const projects = projectsQuery.data ?? [];

  return (
    <section className="page-stack">
      <div className="page-heading page-heading--row">
        <div>
          <p className="eyebrow">Portfolio content</p>
          <h1>Projects</h1>
        </div>
        <Link className="button-link" to="/projects/new">
          Create project
        </Link>
      </div>

      <div className="toolbar">
        <label>
          Status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as ProjectFilter)}>
            <option value="ALL">All statuses</option>
            {PUBLICATION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {projectsQuery.isPending && <p className="surface-state">Loading projects...</p>}

      {projectsQuery.isError && (
        <p className="surface-state surface-state--error">
          {getApiErrorMessage(projectsQuery.error, 'Could not load projects.')}
        </p>
      )}

      {projectsQuery.isSuccess && projects.length === 0 && (
        <section className="empty-state compact-empty-state">
          <p className="eyebrow">No projects</p>
          <h2>Nothing matches this filter.</h2>
          <Link className="button-link" to="/projects/new">
            Create project
          </Link>
        </section>
      )}

      {projects.length > 0 && (
        <div className="table-shell">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Links</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {projects.map((project) => (
                <tr key={project.id}>
                  <td>
                    <strong>{project.title}</strong>
                  </td>
                  <td>{project.slug}</td>
                  <td>
                    <span className={`status-chip status-chip--${project.status.toLowerCase()}`}>
                      {formatStatus(project.status)}
                    </span>
                  </td>
                  <td>{formatDateTime(project.updatedAt)}</td>
                  <td>
                    <div className="indicator-row">
                      <span className={project.githubUrl ? 'indicator indicator--on' : 'indicator'}>GitHub</span>
                      <span className={project.demoUrl ? 'indicator indicator--on' : 'indicator'}>Demo</span>
                    </div>
                  </td>
                  <td>
                    <div className="action-row">
                      <Link to={`/projects/${project.id}/edit`}>Edit</Link>
                      {project.status !== 'PUBLISHED' && (
                        <button
                          type="button"
                          disabled={statusMutation.isPending}
                          onClick={() => handleStatusChange(project, 'PUBLISHED')}
                        >
                          Publish
                        </button>
                      )}
                      {project.status !== 'ARCHIVED' && (
                        <button
                          type="button"
                          disabled={statusMutation.isPending}
                          onClick={() => handleStatusChange(project, 'ARCHIVED')}
                        >
                          Archive
                        </button>
                      )}
                      {project.status !== 'DRAFT' && (
                        <button
                          type="button"
                          disabled={statusMutation.isPending}
                          onClick={() => handleStatusChange(project, 'DRAFT')}
                        >
                          Draft
                        </button>
                      )}
                      <button
                        type="button"
                        className="danger-link"
                        disabled={deleteMutation.isPending}
                        onClick={() => handleDelete(project)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {statusMutation.isError && (
        <p className="surface-state surface-state--error">
          {getApiErrorMessage(statusMutation.error, 'Could not update project status.')}
        </p>
      )}
      {deleteMutation.isError && (
        <p className="surface-state surface-state--error">
          {getApiErrorMessage(deleteMutation.error, 'Could not delete project.')}
        </p>
      )}
    </section>
  );
}
