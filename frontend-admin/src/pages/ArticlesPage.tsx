import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { deleteArticle, fetchArticles, updateArticleStatus } from '../shared/api/articles';
import { queryClient } from '../shared/api/queryClient';
import { getApiErrorMessage } from '../shared/lib/errors';
import { formatDateTime, formatStatus, previewText } from '../shared/lib/format';
import { ArticleResponse, PublicationStatus, PUBLICATION_STATUSES } from '../shared/types/api';

type ArticleFilter = PublicationStatus | 'ALL';

function shouldConfirmPublish(article: ArticleResponse) {
  return !article.summary?.trim();
}

export function ArticlesPage() {
  const [statusFilter, setStatusFilter] = useState<ArticleFilter>('ALL');
  const articlesQuery = useQuery({
    queryKey: ['articles', statusFilter],
    queryFn: () => fetchArticles(statusFilter === 'ALL' ? undefined : statusFilter),
  });

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: PublicationStatus }) => updateArticleStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteArticle,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
    },
  });

  function handleStatusChange(article: ArticleResponse, status: PublicationStatus) {
    if (
      status === 'PUBLISHED' &&
      shouldConfirmPublish(article) &&
      !window.confirm('This article has no summary for the public list. Publish it anyway?')
    ) {
      return;
    }

    statusMutation.mutate({ id: article.id, status });
  }

  function handleDelete(article: ArticleResponse) {
    if (window.confirm(`Delete "${article.title}" permanently? Archiving is usually safer.`)) {
      deleteMutation.mutate(article.id);
    }
  }

  const articles = articlesQuery.data ?? [];

  return (
    <section className="page-stack">
      <div className="page-heading page-heading--row">
        <div>
          <p className="eyebrow">Editorial content</p>
          <h1>Articles</h1>
        </div>
        <Link className="button-link" to="/articles/new">
          Create article
        </Link>
      </div>

      <div className="toolbar">
        <label>
          Status
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as ArticleFilter)}>
            <option value="ALL">All statuses</option>
            {PUBLICATION_STATUSES.map((status) => (
              <option key={status} value={status}>
                {formatStatus(status)}
              </option>
            ))}
          </select>
        </label>
      </div>

      {articlesQuery.isPending && <p className="surface-state">Loading articles...</p>}

      {articlesQuery.isError && (
        <p className="surface-state surface-state--error">
          {getApiErrorMessage(articlesQuery.error, 'Could not load articles.')}
        </p>
      )}

      {articlesQuery.isSuccess && articles.length === 0 && (
        <section className="empty-state compact-empty-state">
          <p className="eyebrow">No articles</p>
          <h2>Nothing matches this filter.</h2>
          <Link className="button-link" to="/articles/new">
            Create article
          </Link>
        </section>
      )}

      {articles.length > 0 && (
        <div className="table-shell">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Slug</th>
                <th>Summary</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {articles.map((article) => (
                <tr key={article.id}>
                  <td>
                    <strong>{article.title}</strong>
                  </td>
                  <td>{article.slug}</td>
                  <td>{article.summary ? previewText(article.summary, 90) : '-'}</td>
                  <td>
                    <span className={`status-chip status-chip--${article.status.toLowerCase()}`}>
                      {formatStatus(article.status)}
                    </span>
                  </td>
                  <td>{formatDateTime(article.updatedAt)}</td>
                  <td>
                    <div className="action-row">
                      <Link to={`/articles/${article.id}/edit`}>Edit</Link>
                      {article.status !== 'PUBLISHED' && (
                        <button
                          type="button"
                          disabled={statusMutation.isPending}
                          onClick={() => handleStatusChange(article, 'PUBLISHED')}
                        >
                          Publish
                        </button>
                      )}
                      {article.status !== 'ARCHIVED' && (
                        <button
                          type="button"
                          disabled={statusMutation.isPending}
                          onClick={() => handleStatusChange(article, 'ARCHIVED')}
                        >
                          Archive
                        </button>
                      )}
                      {article.status !== 'DRAFT' && (
                        <button
                          type="button"
                          disabled={statusMutation.isPending}
                          onClick={() => handleStatusChange(article, 'DRAFT')}
                        >
                          Draft
                        </button>
                      )}
                      <button
                        type="button"
                        className="danger-link"
                        disabled={deleteMutation.isPending}
                        onClick={() => handleDelete(article)}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {statusMutation.isError && (
        <p className="surface-state surface-state--error">
          {getApiErrorMessage(statusMutation.error, 'Could not update article status.')}
        </p>
      )}
      {deleteMutation.isError && (
        <p className="surface-state surface-state--error">
          {getApiErrorMessage(deleteMutation.error, 'Could not delete article.')}
        </p>
      )}
    </section>
  );
}
