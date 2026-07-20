import { useQuery } from '@tanstack/react-query';
import { ArticleGrid } from '../features/article-list/ArticleGrid';
import { fetchArticles } from '../shared/api/articles';
import { LoadingState, PageState } from '../shared/components/PageState';

export function BlogPage() {
  const articlesQuery = useQuery({
    queryKey: ['articles'],
    queryFn: fetchArticles,
  });

  if (articlesQuery.isLoading) {
    return <LoadingState label="Loading articles..." />;
  }

  if (articlesQuery.isError) {
    return (
      <PageState
        eyebrow="Blog"
        title="Articles are unavailable"
        message="Published articles could not be loaded right now."
      />
    );
  }

  const articles = articlesQuery.data ?? [];

  return (
    <section className="stack-page">
      <header className="page-intro">
        <p className="eyebrow">Blog</p>
        <h1>Engineering notes and articles</h1>
        <p>Notes about Java, Spring Boot, backend architecture, APIs, and production engineering.</p>
      </header>

      {articles.length > 0 ? (
        <ArticleGrid articles={articles} />
      ) : (
        <PageState compact title="No published articles yet" message="Published articles will appear here." />
      )}
    </section>
  );
}
