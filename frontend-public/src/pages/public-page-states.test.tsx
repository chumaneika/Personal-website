import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { getPublicDocumentMetadata } from '../app/documentTitles';
import { ArticleDetailsPage } from './ArticleDetailsPage';
import { BlogPage } from './BlogPage';
import { HomePage } from './HomePage';
import { ProjectDetailsPage } from './ProjectDetailsPage';
import { ProjectsPage } from './ProjectsPage';
import { SkillsPage } from './SkillsPage';
import { renderPublicRoute } from '../test/render';

const origin = 'https://malik.example';

describe('public page loading and error states', () => {
  it.each([
    {
      title: 'projects',
      element: (
        <ProjectsPage
          loaderData={{
            projects: [],
            unavailable: true,
            metadata: getPublicDocumentMetadata('/projects', origin),
          }}
        />
      ),
      route: '/projects',
      path: '/projects',
      expected: 'Projects are unavailable',
    },
    {
      title: 'blog',
      element: (
        <BlogPage
          loaderData={{
            articles: [],
            unavailable: true,
            metadata: getPublicDocumentMetadata('/blog', origin),
          }}
        />
      ),
      route: '/blog',
      path: '/blog',
      expected: 'Articles are unavailable',
    },
    {
      title: 'skills',
      element: (
        <SkillsPage
          loaderData={{
            skills: [],
            categories: [],
            categoriesUnavailable: false,
            unavailable: true,
            metadata: getPublicDocumentMetadata('/skills', origin),
          }}
        />
      ),
      route: '/skills',
      path: '/skills',
      expected: 'Skills are unavailable',
    },
    {
      title: 'home',
      element: (
        <HomePage
          loaderData={{
            home: null,
            articles: [],
            articlesUnavailable: true,
            metadata: getPublicDocumentMetadata('/', origin),
          }}
        />
      ),
      route: '/',
      path: '/',
      expected: 'The public site is temporarily unavailable',
    },
  ])('shows the $title server fallback when its loader data is unavailable', async (scenario) => {
    renderPublicRoute(scenario.element, {
      route: scenario.route,
      path: scenario.path,
    });

    expect(await screen.findByRole('heading', { name: scenario.expected })).toBeInTheDocument();
  });

  it('distinguishes missing project and article details from generic failures', async () => {
    const projectView = renderPublicRoute(
      <ProjectDetailsPage
        loaderData={{
          project: null,
          state: 'not-found',
          metadata: getPublicDocumentMetadata('/projects/missing', origin),
        }}
      />,
      {
        route: '/projects/missing',
        path: '/projects/:slug',
      },
    );
    expect(await screen.findByRole('heading', { name: 'Project not found' })).toBeInTheDocument();

    projectView.unmount();
    renderPublicRoute(
      <ArticleDetailsPage
        loaderData={{
          article: null,
          state: 'not-found',
          metadata: getPublicDocumentMetadata('/blog/missing', origin),
        }}
      />,
      {
        route: '/blog/missing',
        path: '/blog/:slug',
      },
    );
    expect(await screen.findByRole('heading', { name: 'Article not found' })).toBeInTheDocument();
  });
});
