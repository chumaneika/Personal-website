import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ProjectFormPage } from './ProjectFormPage';
import { ProjectsPage } from './ProjectsPage';
import { projectFixture } from '../test/fixtures';
import { renderAdminRoute } from '../test/render';

const projectMocks = vi.hoisted(() => ({
  createProject: vi.fn(),
  deleteProject: vi.fn(),
  fetchProject: vi.fn(),
  fetchProjects: vi.fn(),
  updateProject: vi.fn(),
  updateProjectStatus: vi.fn(),
}));

vi.mock('../shared/api/projects', () => projectMocks);

describe('project CRUD', () => {
  beforeEach(() => {
    Object.values(projectMocks).forEach((mock) => mock.mockReset());
  });

  it('creates a project and opens its settings page', async () => {
    const createdProject = projectFixture({ id: 10, title: 'Orders API', slug: 'orders-api' });
    projectMocks.createProject.mockResolvedValue(createdProject);

    const { router, user } = renderAdminRoute(<ProjectFormPage />, {
      route: '/projects/new',
      path: '/projects/new',
    });

    await user.type(screen.getByLabelText('Title'), '  Orders API  ');
    await user.type(screen.getByLabelText('Slug'), 'orders-api');
    await user.type(screen.getByLabelText('Short description'), 'Fast order processing');
    await user.click(screen.getByRole('button', { name: 'Create project' }));

    await waitFor(() =>
      expect(projectMocks.createProject).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Orders API',
          slug: 'orders-api',
          shortDescription: 'Fast order processing',
          status: 'DRAFT',
        }),
      ),
    );
    expect(router.state.location.pathname).toBe('/projects/10/settings');
  });

  it('loads and updates an existing project', async () => {
    const existingProject = projectFixture();
    projectMocks.fetchProject.mockResolvedValue(existingProject);
    projectMocks.updateProject.mockImplementation(async (_id, payload) => ({
      ...existingProject,
      ...payload,
    }));

    const { user } = renderAdminRoute(<ProjectFormPage />, {
      route: '/projects/1/settings',
      path: '/projects/:id/settings',
    });

    const titleInput = await screen.findByLabelText('Title');
    expect(titleInput).toHaveValue('Payments API');
    await user.clear(titleInput);
    await user.type(titleInput, 'Payments Platform');
    await user.click(screen.getByRole('button', { name: 'Save changes' }));

    await waitFor(() =>
      expect(projectMocks.updateProject).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          title: 'Payments Platform',
          slug: 'payments-api',
        }),
      ),
    );
    expect(await screen.findByText('Project changes saved.')).toBeInTheDocument();
  });

  it('lists, publishes, and deletes a project after confirmation', async () => {
    const project = projectFixture();
    projectMocks.fetchProjects.mockResolvedValue([project]);
    projectMocks.updateProjectStatus.mockResolvedValue({
      ...project,
      status: 'PUBLISHED',
    });
    projectMocks.deleteProject.mockResolvedValue(undefined);
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    const { user } = renderAdminRoute(<ProjectsPage />, {
      route: '/projects',
      path: '/projects',
    });

    expect(await screen.findByText('Payments API')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Publish' }));
    await waitFor(() =>
      expect(projectMocks.updateProjectStatus).toHaveBeenCalledWith(1, 'PUBLISHED'),
    );

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(projectMocks.deleteProject.mock.calls[0]?.[0]).toBe(1));
    expect(window.confirm).toHaveBeenCalledWith(
      'Delete "Payments API" permanently? Archiving is usually safer.',
    );
  });
});
