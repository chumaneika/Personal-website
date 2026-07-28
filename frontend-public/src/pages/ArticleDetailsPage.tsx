import { Link, useParams } from 'react-router-dom';
import { data } from 'react-router';
import type { Route } from './+types/ArticleDetailsPage';
import { getArticleDocumentMetadata, getPublicDocumentMetadata } from '../app/documentTitles';
import { getArticleStructuredData } from '../app/structuredData';
import { loadArticle, PublicApiError } from '../shared/api/publicApi.server';
import { PageState } from '../shared/components/PageState';
import { Prose } from '../shared/components/Prose';
import { OptimizedImage } from '../shared/components/OptimizedImage';
import { SeoMetadata } from '../shared/components/SeoMetadata';
import { StructuredData } from '../shared/components/StructuredData';
import { getPublicSiteOrigin } from '../shared/config/runtime.server';
import { formatDate } from '../shared/utils/formatters';

export async function loader({ params, request }: Route.LoaderArgs) {
  const slug = params.slug;
  const origin = getPublicSiteOrigin();
  const fallbackMetadata = getPublicDocumentMetadata(`/blog/${slug ?? ''}`, origin);

  if (!slug) {
    return data(
      { article: null, state: 'not-found' as const, metadata: fallbackMetadata },
      { status: 404 },
    );
  }

  try {
    const article = await loadArticle(slug, request.signal);
    return {
      article,
      state: 'success' as const,
      metadata: getArticleDocumentMetadata(article, origin),
    };
  } catch (error) {
    const notFound = error instanceof PublicApiError && error.status === 404;
    return data(
      {
        article: null,
        state: notFound ? ('not-found' as const) : ('unavailable' as const),
        metadata: fallbackMetadata,
      },
      { status: notFound ? 404 : 503 },
    );
  }
}

export function ArticleDetailsPage({
  loaderData,
}: {
  loaderData: Route.ComponentProps['loaderData'];
}) {
  const { slug } = useParams();
  if (!slug) {
    return (
      <>
        <SeoMetadata metadata={loaderData.metadata} noIndex />
        <PageState
          eyebrow="Article"
          title="Article not found"
          message="The article URL is incomplete."
          action={
            <Link className="button button--secondary" to="/blog">
              Blog
            </Link>
          }
        />
      </>
    );
  }

  if (!loaderData.article) {
    const notFound = loaderData.state === 'not-found';
    return (
      <>
        <SeoMetadata metadata={loaderData.metadata} noIndex={notFound} />
        <PageState
          eyebrow={notFound ? '404' : 'Article'}
          title={notFound ? 'Article not found' : 'Article is unavailable'}
          message={
            notFound
              ? 'This article is not published or does not exist.'
              : 'The article could not be loaded right now.'
          }
          action={
            <Link className="button button--secondary" to="/blog">
              Blog
            </Link>
          }
        />
      </>
    );
  }

  const article = loaderData.article;
  const publishedAt = formatDate(article.createdAt);
  const updatedAt = formatDate(article.updatedAt);

  return (
    <article className="project-detail article-detail">
      <SeoMetadata metadata={loaderData.metadata} />
      <StructuredData
        data={getArticleStructuredData(
          article,
          loaderData.metadata.canonicalUrl,
          loaderData.metadata.description,
        )}
      />
      <header className="project-detail__header">
        <p className="eyebrow">Article</p>
        <h1>{article.title}</h1>
        {article.summary && <p className="lead">{article.summary}</p>}
        <p className="article-detail__date">
          {[
            publishedAt && `Published ${publishedAt}`,
            updatedAt !== publishedAt && updatedAt && `Updated ${updatedAt}`,
          ]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </header>

      {article.coverImageUrl && (
        <OptimizedImage
          className="project-detail__cover"
          src={article.coverImageUrl}
          avifSrc={article.coverImageAvifUrl}
          webpSrc={article.coverImageWebpUrl}
          pictureClassName="project-detail__picture"
          alt=""
          width={1600}
          height={900}
          loading="eager"
          decoding="async"
          fetchPriority="high"
        />
      )}

      <section className="content-section article-detail__content">
        <Prose content={article.content} fallback="Article content is being updated." />
      </section>

      <div>
        <Link className="text-link" to="/blog">
          Back to all articles
        </Link>
      </div>
    </article>
  );
}

export default ArticleDetailsPage;
