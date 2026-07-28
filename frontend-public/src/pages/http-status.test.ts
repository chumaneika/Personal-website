import { describe, expect, it, vi } from 'vitest';
import { loader as articleLoader } from './ArticleDetailsPage';
import { loader as notFoundLoader } from './NotFoundPage';
import { loader as projectLoader } from './ProjectDetailsPage';

function loaderArgs<TLoader extends (args: never) => unknown>(
  loader: TLoader,
  url: string,
  params: Record<string, string>,
) {
  return {
    request: new Request(url),
    params,
    context: {},
  } as Parameters<TLoader>[0];
}

describe('public HTTP error statuses', () => {
  it('returns 404 for an unknown route', () => {
    const result = notFoundLoader(
      loaderArgs(notFoundLoader, 'https://malik.example/unknown-page', {
        '*': 'unknown-page',
      }),
    );

    expect(result).toMatchObject({
      init: { status: 404 },
      data: {
        metadata: {
          canonicalUrl: 'http://localhost:5173/unknown-page',
        },
      },
    });
  });

  it('returns 404 when a project does not exist', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(null, { status: 404 }));

    const result = await projectLoader(
      loaderArgs(projectLoader, 'https://malik.example/projects/missing-project', {
        slug: 'missing-project',
      }),
    );

    expect(result).toMatchObject({
      init: { status: 404 },
      data: {
        state: 'not-found',
      },
    });
  });

  it('returns 404 when an article does not exist', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce(new Response(null, { status: 404 }));

    const result = await articleLoader(
      loaderArgs(articleLoader, 'https://malik.example/blog/missing-article', {
        slug: 'missing-article',
      }),
    );

    expect(result).toMatchObject({
      init: { status: 404 },
      data: {
        state: 'not-found',
      },
    });
  });

  it('returns 503 rather than 404 when the backend is unavailable', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValueOnce(new TypeError('Backend unavailable'));

    const result = await projectLoader(
      loaderArgs(projectLoader, 'https://malik.example/projects/temporarily-unavailable', {
        slug: 'temporarily-unavailable',
      }),
    );

    expect(result).toMatchObject({
      init: { status: 503 },
      data: {
        state: 'unavailable',
      },
    });
  });
});
