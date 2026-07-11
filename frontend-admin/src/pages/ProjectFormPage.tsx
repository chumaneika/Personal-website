import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import {
  createProject,
  fetchProject,
  updateProject,
  updateProjectStatus,
} from '../shared/api/projects';
import { queryClient } from '../shared/api/queryClient';
import { getApiErrorMessage } from '../shared/lib/errors';
import { nullableText } from '../shared/lib/form';
import { formatDateTime, formatStatus } from '../shared/lib/format';
import { ProjectRequest, ProjectResponse, PublicationStatus, PUBLICATION_STATUSES } from '../shared/types/api';

const slugRegex = /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/;
const optionalUrl = z
  .string()
  .max(512, 'Use 512 characters or fewer.')
  .refine((value) => value.length === 0 || z.string().url().safeParse(value).success, 'Enter a valid URL.');

const projectSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required.').max(200, 'Use 200 characters or fewer.'),
    slug: z
      .string()
      .trim()
      .min(1, 'Slug is required.')
      .max(180, 'Use 180 characters or fewer.')
      .regex(slugRegex, 'Use letters, numbers, and single hyphens between words.'),
    shortDescription: z.string().max(1000, 'Use 1000 characters or fewer.'),
    fullDescription: z.string().max(8000, 'Use 8000 characters or fewer.'),
    problemDescription: z.string().max(4000, 'Use 4000 characters or fewer.'),
    solutionDescription: z.string().max(4000, 'Use 4000 characters or fewer.'),
    technologyStack: z.string().max(2000, 'Use 2000 characters or fewer.'),
    githubUrl: optionalUrl,
    demoUrl: optionalUrl,
    coverImageUrl: optionalUrl,
    status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
    startedAt: z.string(),
    completedAt: z.string(),
  })
  .refine((values) => !values.startedAt || !values.completedAt || values.completedAt >= values.startedAt, {
    message: 'Completed date cannot be before started date.',
    path: ['completedAt'],
  });

type ProjectFormValues = z.infer<typeof projectSchema>;

const emptyProjectValues: ProjectFormValues = {
  title: '',
  slug: '',
  shortDescription: '',
  fullDescription: '',
  problemDescription: '',
  solutionDescription: '',
  technologyStack: '',
  githubUrl: '',
  demoUrl: '',
  coverImageUrl: '',
  status: 'DRAFT',
  startedAt: '',
  completedAt: '',
};

function dateInputValue(value: string | null) {
  return value ? value.slice(0, 10) : '';
}

function getProjectValues(project: ProjectResponse): ProjectFormValues {
  return {
    title: project.title,
    slug: project.slug,
    shortDescription: project.shortDescription ?? '',
    fullDescription: project.fullDescription ?? '',
    problemDescription: project.problemDescription ?? '',
    solutionDescription: project.solutionDescription ?? '',
    technologyStack: project.technologyStack ?? '',
    githubUrl: project.githubUrl ?? '',
    demoUrl: project.demoUrl ?? '',
    coverImageUrl: project.coverImageUrl ?? '',
    status: project.status,
    startedAt: dateInputValue(project.startedAt),
    completedAt: dateInputValue(project.completedAt),
  };
}

function toProjectRequest(values: ProjectFormValues): ProjectRequest {
  return {
    title: values.title.trim(),
    slug: values.slug.trim(),
    shortDescription: nullableText(values.shortDescription),
    fullDescription: nullableText(values.fullDescription),
    problemDescription: nullableText(values.problemDescription),
    solutionDescription: nullableText(values.solutionDescription),
    technologyStack: nullableText(values.technologyStack),
    githubUrl: nullableText(values.githubUrl),
    demoUrl: nullableText(values.demoUrl),
    coverImageUrl: nullableText(values.coverImageUrl),
    status: values.status,
    startedAt: nullableText(values.startedAt),
    completedAt: nullableText(values.completedAt),
  };
}

function shouldConfirmPublish(values: ProjectFormValues) {
  return !values.shortDescription.trim() || !values.fullDescription.trim();
}

export function ProjectFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const projectId = id ? Number(id) : null;
  const isEditing = projectId !== null && Number.isInteger(projectId);
  const hasInvalidId = Boolean(id) && !isEditing;

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: emptyProjectValues,
  });

  const projectQuery = useQuery({
    queryKey: ['project', projectId],
    queryFn: () => fetchProject(projectId as number),
    enabled: isEditing,
  });

  useEffect(() => {
    if (projectQuery.isSuccess && projectQuery.data && !form.formState.isDirty) {
      form.reset(getProjectValues(projectQuery.data));
    }
  }, [form, form.formState.isDirty, projectQuery.data, projectQuery.isSuccess]);

  const saveMutation = useMutation({
    mutationFn: (values: ProjectFormValues) => {
      const payload = toProjectRequest(values);
      return isEditing ? updateProject(projectId as number, payload) : createProject(payload);
    },
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      queryClient.setQueryData(['project', project.id], project);
      form.reset(getProjectValues(project));

      if (!isEditing) {
        navigate(`/projects/${project.id}/edit`, { replace: true });
      }
    },
  });

  const statusMutation = useMutation({
    mutationFn: (status: PublicationStatus) => updateProjectStatus(projectId as number, status),
    onSuccess: (project) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      queryClient.setQueryData(['project', project.id], project);
      form.setValue('status', project.status);
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    if (
      values.status === 'PUBLISHED' &&
      shouldConfirmPublish(values) &&
      !window.confirm('This project has empty public description fields. Save it as published anyway?')
    ) {
      return;
    }

    saveMutation.mutate(values);
  });

  function handleQuickStatus(status: PublicationStatus) {
    if (
      status === 'PUBLISHED' &&
      shouldConfirmPublish(form.getValues()) &&
      !window.confirm('This project has empty public description fields. Publish it anyway?')
    ) {
      return;
    }

    statusMutation.mutate(status);
  }

  if (hasInvalidId) {
    return (
      <section className="empty-state">
        <p className="eyebrow">Invalid project</p>
        <h1>Project id is not valid.</h1>
        <Link to="/projects">Back to projects</Link>
      </section>
    );
  }

  const project = projectQuery.data;
  const canRenderForm = !isEditing || projectQuery.isSuccess;

  return (
    <section className="page-stack">
      <div className="page-heading page-heading--row">
        <div>
          <p className="eyebrow">Portfolio content</p>
          <h1>{isEditing ? 'Edit project' : 'Create project'}</h1>
        </div>
        <Link className="button-link button-link--secondary" to="/projects">
          Back to projects
        </Link>
      </div>

      {isEditing && projectQuery.isPending && <p className="surface-state">Loading project...</p>}

      {projectQuery.isError && (
        <p className="surface-state surface-state--error">
          {getApiErrorMessage(projectQuery.error, 'Could not load project.')}
        </p>
      )}

      {project && (
        <div className="metadata-row">
          <span>Created {formatDateTime(project.createdAt)}</span>
          <span>Updated {formatDateTime(project.updatedAt)}</span>
        </div>
      )}

      {isEditing && project && (
        <section className="work-panel compact-panel">
          <div className="section-heading">
            <h2>Status actions</h2>
          </div>
          <div className="quick-actions">
            {PUBLICATION_STATUSES.map((status) => (
              <button
                key={status}
                type="button"
                disabled={statusMutation.isPending || form.watch('status') === status}
                onClick={() => handleQuickStatus(status)}
              >
                {formatStatus(status)}
              </button>
            ))}
          </div>
          {statusMutation.isError && (
            <p className="form-error">{getApiErrorMessage(statusMutation.error, 'Could not update status.')}</p>
          )}
        </section>
      )}

      {canRenderForm && (
        <form className="stacked-form wide-form" onSubmit={onSubmit}>
          <div className="form-grid">
            <label>
              Title
              <input type="text" {...form.register('title')} />
              {form.formState.errors.title && <span>{form.formState.errors.title.message}</span>}
            </label>
            <label>
              Slug
              <input type="text" {...form.register('slug')} />
              {form.formState.errors.slug && <span>{form.formState.errors.slug.message}</span>}
            </label>
            <label>
              Status
              <select {...form.register('status')}>
                {PUBLICATION_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {formatStatus(status)}
                  </option>
                ))}
              </select>
              {form.formState.errors.status && <span>{form.formState.errors.status.message}</span>}
            </label>
          </div>

          <label>
            Short description
            <textarea rows={3} {...form.register('shortDescription')} />
            {form.formState.errors.shortDescription && <span>{form.formState.errors.shortDescription.message}</span>}
          </label>

          <label>
            Full description
            <textarea rows={6} {...form.register('fullDescription')} />
            {form.formState.errors.fullDescription && <span>{form.formState.errors.fullDescription.message}</span>}
          </label>

          <div className="form-grid">
            <label>
              Problem description
              <textarea rows={4} {...form.register('problemDescription')} />
              {form.formState.errors.problemDescription && (
                <span>{form.formState.errors.problemDescription.message}</span>
              )}
            </label>
            <label>
              Solution description
              <textarea rows={4} {...form.register('solutionDescription')} />
              {form.formState.errors.solutionDescription && (
                <span>{form.formState.errors.solutionDescription.message}</span>
              )}
            </label>
          </div>

          <label>
            Technology stack
            <textarea rows={4} {...form.register('technologyStack')} />
            {form.formState.errors.technologyStack && <span>{form.formState.errors.technologyStack.message}</span>}
          </label>

          <div className="form-grid">
            <label>
              GitHub URL
              <input type="url" {...form.register('githubUrl')} />
              {form.formState.errors.githubUrl && <span>{form.formState.errors.githubUrl.message}</span>}
            </label>
            <label>
              Demo URL
              <input type="url" {...form.register('demoUrl')} />
              {form.formState.errors.demoUrl && <span>{form.formState.errors.demoUrl.message}</span>}
            </label>
            <label>
              Cover image URL
              <input type="url" {...form.register('coverImageUrl')} />
              {form.formState.errors.coverImageUrl && <span>{form.formState.errors.coverImageUrl.message}</span>}
            </label>
            <label>
              Started at
              <input type="date" {...form.register('startedAt')} />
              {form.formState.errors.startedAt && <span>{form.formState.errors.startedAt.message}</span>}
            </label>
            <label>
              Completed at
              <input type="date" {...form.register('completedAt')} />
              {form.formState.errors.completedAt && <span>{form.formState.errors.completedAt.message}</span>}
            </label>
          </div>

          <div className="form-actions">
            <button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : isEditing ? 'Save project' : 'Create project'}
            </button>
          </div>

          {saveMutation.isSuccess && <p className="form-note">Project saved.</p>}
          {saveMutation.isError && (
            <p className="form-error">{getApiErrorMessage(saveMutation.error, 'Could not save project.')}</p>
          )}
        </form>
      )}
    </section>
  );
}
