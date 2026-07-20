import type { ArticleSummaryResponse } from '../../shared/types/api';
import { ArticleCard } from './ArticleCard';

type ArticleGridProps = {
  articles: ArticleSummaryResponse[];
};

export function ArticleGrid({ articles }: ArticleGridProps) {
  return (
    <div className="project-grid article-grid">
      {articles.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </div>
  );
}
