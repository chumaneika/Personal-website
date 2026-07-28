import { data } from 'react-router';
import type { Route } from './+types/BlogPage';
import { getPublicDocumentMetadata } from '../app/documentTitles';
import { ArticleGrid } from '../features/article-list/ArticleGrid';
import { loadArticles } from '../shared/api/publicApi.server';
import { PageState } from '../shared/components/PageState';
import { SeoMetadata } from '../shared/components/SeoMetadata';
import { getPublicSiteOrigin } from '../shared/config/runtime.server';

export async function loader({ request }: Route.LoaderArgs) {
  const metadata = getPublicDocumentMetadata('/blog', getPublicSiteOrigin());

  try {
    return { articles: await loadArticles(request.signal), unavailable: false, metadata };
  } catch {
    return data({ articles: [], unavailable: true, metadata }, { status: 503 });
  }
}

export function BlogPage({ loaderData }: { loaderData: Route.ComponentProps['loaderData'] }) {
  if (loaderData.unavailable) {
    return (
      <>
        <SeoMetadata metadata={loaderData.metadata} />
        <PageState
          eyebrow="Blog"
          title="Articles are unavailable"
          message="Published articles could not be loaded right now."
        />
      </>
    );
  }

  const articles = loaderData.articles;

  return (
    <section className="stack-page">
      <SeoMetadata metadata={loaderData.metadata} />
      <header className="page-intro">
        <p className="eyebrow">Blog</p>
        <h1>Engineering notes and articles</h1>
        <p>
          Notes about Java, Spring Boot, backend architecture, APIs, and production engineering.
        </p>
      </header>

      {articles.length > 0 ? (
        <ArticleGrid articles={articles} />
      ) : (
        <PageState
          compact
          title="No published articles yet"
          message="Published articles will appear here."
        />
      )}
    </section>
  );
}

export default BlogPage;
