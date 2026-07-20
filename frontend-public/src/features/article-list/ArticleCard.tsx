import { Link } from 'react-router-dom';
import type { ArticleSummaryResponse } from '../../shared/types/api';
import { formatDate } from '../../shared/utils/formatters';

type ArticleCardProps = {
  article: ArticleSummaryResponse;
};

export function ArticleCard({ article }: ArticleCardProps) {
  const publishedAt = formatDate(article.createdAt);

  return (
    <article className="project-card article-card">
      {article.coverImageUrl ? (
        <img className="project-card__image" src={article.coverImageUrl} alt="" loading="lazy" />
      ) : (
        <div className="project-card__placeholder" aria-hidden="true">
          {article.title.slice(0, 2).toUpperCase()}
        </div>
      )}

      <div className="project-card__body">
        <div>
          <h2>{article.title}</h2>
          {article.summary && <p>{article.summary}</p>}
        </div>

        {publishedAt && <p className="article-card__meta">Published {publishedAt}</p>}

        <div className="project-card__actions">
          <Link className="text-link" to={`/blog/${article.slug}`}>
            Read article
          </Link>
        </div>
      </div>
    </article>
  );
}
