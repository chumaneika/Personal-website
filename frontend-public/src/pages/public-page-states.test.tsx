import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ArticleDetailsPage } from './ArticleDetailsPage';
import { BlogPage } from './BlogPage';
import { HomePage } from './HomePage';
import { ProjectDetailsPage } from './ProjectDetailsPage';
import { ProjectsPage } from './ProjectsPage';
import { SkillsPage } from './SkillsPage';
import { renderPublicRoute } from '../test/render';

const articleMocks = vi.hoisted(() => ({
  fetchArticleBySlug: vi.fn(),
  fetchArticles: vi.fn(),
}));
const homeMocks = vi.hoisted(() => ({
  fetchHome: vi.fn(),
}));
const projectMocks = vi.hoisted(() => ({
  fetchProjectBySlug: vi.fn(),
  fetchProjects: vi.fn(),
}));
const skillMocks = vi.hoisted(() => ({
  fetchSkills: vi.fn(),
}));
const metaMocks = vi.hoisted(() => ({
  fetchSkillCategories: vi.fn(),
}));

vi.mock('../shared/api/articles', () => articleMocks);
vi.mock('../shared/api/home', () => homeMocks);
vi.mock('../shared/api/projects', () => projectMocks);
vi.mock('../shared/api/skills', () => skillMocks);
vi.mock('../shared/api/meta', () => metaMocks);

describe('public page loading and error states', () => {
  beforeEach(() => {
    Object.values(articleMocks).forEach((mock) => mock.mockReset());
    Object.values(homeMocks).forEach((mock) => mock.mockReset());
    Object.values(projectMocks).forEach((mock) => mock.mockReset());
    Object.values(skillMocks).forEach((mock) => mock.mockReset());
    Object.values(metaMocks).forEach((mock) => mock.mockReset());
    metaMocks.fetchSkillCategories.mockResolvedValue([]);
  });

  it('shows a loading state while projects are being fetched', () => {
    projectMocks.fetchProjects.mockReturnValue(
      new Promise<never>(() => {
        // Intentionally pending to assert the intermediate state.
      }),
    );

    renderPublicRoute(<ProjectsPage />, {
      route: '/projects',
      path: '/projects',
    });

    expect(screen.getByText('Loading projects...')).toBeInTheDocument();
    expect(
      screen.getByText('Loading projects...').closest('[aria-busy="true"]'),
    ).toBeInTheDocument();
  });

  it.each([
    {
      title: 'projects',
      element: <ProjectsPage />,
      route: '/projects',
      path: '/projects',
      arrange: () => projectMocks.fetchProjects.mockRejectedValue(new Error('Offline')),
      expected: 'Projects are unavailable',
    },
    {
      title: 'blog',
      element: <BlogPage />,
      route: '/blog',
      path: '/blog',
      arrange: () => articleMocks.fetchArticles.mockRejectedValue(new Error('Offline')),
      expected: 'Articles are unavailable',
    },
    {
      title: 'skills',
      element: <SkillsPage />,
      route: '/skills',
      path: '/skills',
      arrange: () => skillMocks.fetchSkills.mockRejectedValue(new Error('Offline')),
      expected: 'Skills are unavailable',
    },
    {
      title: 'home',
      element: <HomePage />,
      route: '/',
      path: '/',
      arrange: () => {
        homeMocks.fetchHome.mockRejectedValue(new Error('Offline'));
        articleMocks.fetchArticles.mockResolvedValue([]);
      },
      expected: 'The public site is temporarily unavailable',
    },
  ])('shows the $title fallback when its primary request fails', async (scenario) => {
    scenario.arrange();
    renderPublicRoute(scenario.element, {
      route: scenario.route,
      path: scenario.path,
    });

    expect(await screen.findByRole('heading', { name: scenario.expected })).toBeInTheDocument();
  });

  it('distinguishes missing project and article details from generic failures', async () => {
    const notFoundError = { isAxiosError: true, response: { status: 404 } };
    projectMocks.fetchProjectBySlug.mockRejectedValue(notFoundError);
    articleMocks.fetchArticleBySlug.mockRejectedValue(notFoundError);

    const projectView = renderPublicRoute(<ProjectDetailsPage />, {
      route: '/projects/missing',
      path: '/projects/:slug',
    });
    expect(await screen.findByRole('heading', { name: 'Project not found' })).toBeInTheDocument();

    projectView.unmount();
    renderPublicRoute(<ArticleDetailsPage />, {
      route: '/blog/missing',
      path: '/blog/:slug',
    });
    expect(await screen.findByRole('heading', { name: 'Article not found' })).toBeInTheDocument();
  });
});
