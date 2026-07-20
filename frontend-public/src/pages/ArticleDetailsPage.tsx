import { useQuery } from '@tanstack/react-query';
import { Link, useParams } from 'react-router-dom';
import { fetchArticleBySlug } from '../shared/api/articles';
import { LoadingState, PageState } from '../shared/components/PageState';
import { Prose } from '../shared/components/Prose';
import { formatDate } from '../shared/utils/formatters';
import { isNotFoundError } from '../shared/utils/errors';

export function ArticleDetailsPage() {
  const { slug } = useParams();
  const articleQuery = useQuery({
    queryKey: ['article', slug],
    queryFn: () => fetchArticleBySlug(slug ?? ''),
    enabled: Boolean(slug),
  });

  if (!slug) {
    return (
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
    );
  }

  if (articleQuery.isLoading) {
    return <LoadingState label="Loading article..." />;
  }

  if (articleQuery.isError) {
    const notFound = isNotFoundError(articleQuery.error);

    return (
      <PageState
        eyebrow={notFound ? '404' : 'Article'}
        title={notFound ? 'Article not found' : 'Article is unavailable'}
        message={notFound ? 'This article is not published or does not exist.' : 'The article could not be loaded right now.'}
        action={
          <Link className="button button--secondary" to="/blog">
            Blog
          </Link>
        }
      />
    );
  }

  const article = articleQuery.data;

  if (!article) {
    return (
      <PageState
        eyebrow="Article"
        title="Article not found"
        message="This article is not available."
        action={
          <Link className="button button--secondary" to="/blog">
            Blog
          </Link>
        }
      />
    );
  }

  const publishedAt = formatDate(article.createdAt);
  const updatedAt = formatDate(article.updatedAt);

  return (
    <article className="project-detail article-detail">
      <header className="project-detail__header">
        <p className="eyebrow">Article</p>
        <h1>{article.title}</h1>
        {article.summary && <p className="lead">{article.summary}</p>}
        <p className="article-detail__date">
          {[publishedAt && `Published ${publishedAt}`, updatedAt !== publishedAt && updatedAt && `Updated ${updatedAt}`]
            .filter(Boolean)
            .join(' · ')}
        </p>
      </header>

      {article.coverImageUrl && <img className="project-detail__cover" src={article.coverImageUrl} alt="" />}

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
