import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { z } from 'zod';
import {
  createArticle,
  fetchArticle,
  updateArticle,
  updateArticleStatus,
} from '../shared/api/articles';
import { queryClient } from '../shared/api/queryClient';
import { getApiErrorMessage } from '../shared/lib/errors';
import { nullableText } from '../shared/lib/form';
import { formatDateTime, formatStatus } from '../shared/lib/format';
import { ArticleRequest, ArticleResponse, PublicationStatus, PUBLICATION_STATUSES } from '../shared/types/api';

const slugRegex = /^[A-Za-z0-9]+(?:-[A-Za-z0-9]+)*$/;
const optionalUrl = z
  .string()
  .max(512, 'Use 512 characters or fewer.')
  .refine((value) => value.length === 0 || z.string().url().safeParse(value).success, 'Enter a valid URL.');

const articleSchema = z.object({
  title: z.string().trim().min(1, 'Title is required.').max(200, 'Use 200 characters or fewer.'),
  slug: z
    .string()
    .trim()
    .min(1, 'Slug is required.')
    .max(180, 'Use 180 characters or fewer.')
    .regex(slugRegex, 'Use letters, numbers, and single hyphens between words.'),
  summary: z.string().max(1000, 'Use 1000 characters or fewer.'),
  content: z.string().trim().min(1, 'Content is required.').max(100000, 'Use 100000 characters or fewer.'),
  coverImageUrl: optionalUrl,
  status: z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']),
});

type ArticleFormValues = z.infer<typeof articleSchema>;

const emptyArticleValues: ArticleFormValues = {
  title: '',
  slug: '',
  summary: '',
  content: '',
  coverImageUrl: '',
  status: 'DRAFT',
};

function getArticleValues(article: ArticleResponse): ArticleFormValues {
  return {
    title: article.title,
    slug: article.slug,
    summary: article.summary ?? '',
    content: article.content,
    coverImageUrl: article.coverImageUrl ?? '',
    status: article.status,
  };
}

function toArticleRequest(values: ArticleFormValues): ArticleRequest {
  return {
    title: values.title.trim(),
    slug: values.slug.trim(),
    summary: nullableText(values.summary),
    content: values.content.trim(),
    coverImageUrl: nullableText(values.coverImageUrl),
    status: values.status,
  };
}

function shouldConfirmPublish(values: ArticleFormValues) {
  return !values.summary.trim();
}

export function ArticleFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const articleId = id ? Number(id) : null;
  const isEditing = articleId !== null && Number.isInteger(articleId);
  const hasInvalidId = Boolean(id) && !isEditing;

  const form = useForm<ArticleFormValues>({
    resolver: zodResolver(articleSchema),
    defaultValues: emptyArticleValues,
  });

  const articleQuery = useQuery({
    queryKey: ['article', articleId],
    queryFn: () => fetchArticle(articleId as number),
    enabled: isEditing,
  });

  useEffect(() => {
    if (articleQuery.isSuccess && articleQuery.data && !form.formState.isDirty) {
      form.reset(getArticleValues(articleQuery.data));
    }
  }, [articleQuery.data, articleQuery.isSuccess, form, form.formState.isDirty]);

  const saveMutation = useMutation({
    mutationFn: (values: ArticleFormValues) => {
      const payload = toArticleRequest(values);
      return isEditing ? updateArticle(articleId as number, payload) : createArticle(payload);
    },
    onSuccess: (article) => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      queryClient.setQueryData(['article', article.id], article);
      form.reset(getArticleValues(article));

      if (!isEditing) {
        navigate(`/articles/${article.id}/edit`, { replace: true });
      }
    },
  });

  const statusMutation = useMutation({
    mutationFn: (status: PublicationStatus) => updateArticleStatus(articleId as number, status),
    onSuccess: (article) => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['admin-dashboard'] });
      queryClient.setQueryData(['article', article.id], article);
      form.setValue('status', article.status);
    },
  });

  const onSubmit = form.handleSubmit((values) => {
    if (
      values.status === 'PUBLISHED' &&
      shouldConfirmPublish(values) &&
      !window.confirm('This article has no summary for the public list. Save it as published anyway?')
    ) {
      return;
    }

    saveMutation.mutate(values);
  });

  function handleQuickStatus(status: PublicationStatus) {
    if (
      status === 'PUBLISHED' &&
      shouldConfirmPublish(form.getValues()) &&
      !window.confirm('This article has no summary for the public list. Publish it anyway?')
    ) {
      return;
    }

    statusMutation.mutate(status);
  }

  if (hasInvalidId) {
    return (
      <section className="empty-state">
        <p className="eyebrow">Invalid article</p>
        <h1>Article id is not valid.</h1>
        <Link to="/articles">Back to articles</Link>
      </section>
    );
  }

  const article = articleQuery.data;
  const canRenderForm = !isEditing || articleQuery.isSuccess;

  return (
    <section className="page-stack">
      <div className="page-heading page-heading--row">
        <div>
          <p className="eyebrow">Editorial content</p>
          <h1>{isEditing ? 'Edit article' : 'Create article'}</h1>
        </div>
        <Link className="button-link button-link--secondary" to="/articles">
          Back to articles
        </Link>
      </div>

      {isEditing && articleQuery.isPending && <p className="surface-state">Loading article...</p>}

      {articleQuery.isError && (
        <p className="surface-state surface-state--error">
          {getApiErrorMessage(articleQuery.error, 'Could not load article.')}
        </p>
      )}

      {article && (
        <div className="metadata-row">
          <span>Created {formatDateTime(article.createdAt)}</span>
          <span>Updated {formatDateTime(article.updatedAt)}</span>
        </div>
      )}

      {isEditing && article && (
        <section className="work-panel compact-panel">
          <div className="section-heading">
            <h2>Status actions</h2>
          </div>
          <div className="quick-actions">
            {PUBLICATION_STATUSES.map((status) => (
              <button
                key={status}
                type="button"
                disabled={statusMutation.isPending || form.watch('status') === status}
                onClick={() => handleQuickStatus(status)}
              >
                {formatStatus(status)}
              </button>
            ))}
          </div>
          {statusMutation.isError && (
            <p className="form-error">{getApiErrorMessage(statusMutation.error, 'Could not update status.')}</p>
          )}
        </section>
      )}

      {canRenderForm && (
        <form className="stacked-form wide-form" onSubmit={onSubmit}>
          <div className="form-grid">
            <label>
              Title
              <input type="text" {...form.register('title')} />
              {form.formState.errors.title && <span>{form.formState.errors.title.message}</span>}
            </label>
            <label>
              Slug
              <input type="text" {...form.register('slug')} />
              {form.formState.errors.slug && <span>{form.formState.errors.slug.message}</span>}
            </label>
            <label>
              Status
              <select {...form.register('status')}>
                {PUBLICATION_STATUSES.map((status) => (
                  <option key={status} value={status}>
                    {formatStatus(status)}
                  </option>
                ))}
              </select>
              {form.formState.errors.status && <span>{form.formState.errors.status.message}</span>}
            </label>
            <label>
              Cover image URL (optional)
              <input type="url" placeholder="https://example.com/cover.jpg" {...form.register('coverImageUrl')} />
              {form.formState.errors.coverImageUrl && <span>{form.formState.errors.coverImageUrl.message}</span>}
            </label>
          </div>

          <label>
            Summary
            <textarea rows={4} {...form.register('summary')} />
            {form.formState.errors.summary && <span>{form.formState.errors.summary.message}</span>}
          </label>

          <label>
            Content
            <textarea rows={18} {...form.register('content')} />
            {form.formState.errors.content && <span>{form.formState.errors.content.message}</span>}
          </label>

          <div className="form-actions">
            <button type="submit" disabled={saveMutation.isPending}>
              {saveMutation.isPending ? 'Saving...' : isEditing ? 'Save article' : 'Create article'}
            </button>
          </div>

          {saveMutation.isSuccess && <p className="form-note">Article saved.</p>}
          {saveMutation.isError && (
            <p className="form-error">{getApiErrorMessage(saveMutation.error, 'Could not save article.')}</p>
          )}
        </form>
      )}
    </section>
  );
}
