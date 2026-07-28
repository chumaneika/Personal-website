import { screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ArticleFormPage } from './ArticleFormPage';
import { ArticlesPage } from './ArticlesPage';
import { articleFixture } from '../test/fixtures';
import { renderAdminRoute } from '../test/render';

const articleMocks = vi.hoisted(() => ({
  createArticle: vi.fn(),
  deleteArticle: vi.fn(),
  fetchArticle: vi.fn(),
  fetchArticles: vi.fn(),
  updateArticle: vi.fn(),
  updateArticleStatus: vi.fn(),
}));

vi.mock('../shared/api/articles', () => articleMocks);

describe('article CRUD', () => {
  beforeEach(() => {
    Object.values(articleMocks).forEach((mock) => mock.mockReset());
  });

  it('creates an article and opens the edit page', async () => {
    const createdArticle = articleFixture({ id: 20, title: 'Tracing APIs', slug: 'tracing-apis' });
    articleMocks.createArticle.mockResolvedValue(createdArticle);

    const { router, user } = renderAdminRoute(<ArticleFormPage />, {
      route: '/articles/new',
      path: '/articles/new',
    });

    await user.type(screen.getByLabelText('Title'), 'Tracing APIs');
    await user.type(screen.getByLabelText('Slug'), 'tracing-apis');
    await user.type(screen.getByLabelText('Summary'), 'A practical tracing guide.');
    await user.type(screen.getByLabelText('Content'), 'Start with a correlation identifier.');
    await user.click(screen.getByRole('button', { name: 'Create article' }));

    await waitFor(() =>
      expect(articleMocks.createArticle).toHaveBeenCalledWith({
        title: 'Tracing APIs',
        slug: 'tracing-apis',
        summary: 'A practical tracing guide.',
        content: 'Start with a correlation identifier.',
        coverImageUrl: null,
        coverImageAvifUrl: null,
        coverImageWebpUrl: null,
        status: 'DRAFT',
      }),
    );
    expect(router.state.location.pathname).toBe('/articles/20/edit');
  });

  it('loads and updates an existing article', async () => {
    const existingArticle = articleFixture();
    articleMocks.fetchArticle.mockResolvedValue(existingArticle);
    articleMocks.updateArticle.mockImplementation(async (_id, payload) => ({
      ...existingArticle,
      ...payload,
    }));

    const { user } = renderAdminRoute(<ArticleFormPage />, {
      route: '/articles/2/edit',
      path: '/articles/:id/edit',
    });

    const contentInput = await screen.findByLabelText('Content');
    expect(contentInput).toHaveValue(existingArticle.content);
    await user.clear(contentInput);
    await user.type(contentInput, 'Updated article content.');
    await user.click(screen.getByRole('button', { name: 'Save article' }));

    await waitFor(() =>
      expect(articleMocks.updateArticle).toHaveBeenCalledWith(
        2,
        expect.objectContaining({ content: 'Updated article content.' }),
      ),
    );
    const saveStatus = await screen.findByRole('status');
    expect(saveStatus).toHaveAttribute('aria-live', 'polite');
    expect(saveStatus).toHaveTextContent('Article saved.');
  });

  it('lists, archives, and deletes an article after confirmation', async () => {
    const article = articleFixture();
    articleMocks.fetchArticles.mockResolvedValue([article]);
    articleMocks.updateArticleStatus.mockResolvedValue({
      ...article,
      status: 'ARCHIVED',
    });
    articleMocks.deleteArticle.mockResolvedValue(undefined);
    vi.spyOn(window, 'confirm').mockReturnValue(true);

    const { user } = renderAdminRoute(<ArticlesPage />, {
      route: '/articles',
      path: '/articles',
    });

    expect(await screen.findByText('Reliable APIs')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Archive' }));
    await waitFor(() =>
      expect(articleMocks.updateArticleStatus).toHaveBeenCalledWith(2, 'ARCHIVED'),
    );

    await user.click(screen.getByRole('button', { name: 'Delete' }));
    await waitFor(() => expect(articleMocks.deleteArticle.mock.calls[0]?.[0]).toBe(2));
  });
});
