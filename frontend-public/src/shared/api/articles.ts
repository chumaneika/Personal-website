import type { ArticleResponse, ArticleSummaryResponse } from '../types/api';
import { httpClient } from './httpClient';
import { requireArrayResponse, requireObjectResponse } from './responseGuards';

export async function fetchArticles() {
  const response = await httpClient.get<unknown>('/articles');
  return requireArrayResponse<ArticleSummaryResponse>(response.data, 'articles');
}

export async function fetchArticleBySlug(slug: string) {
  const response = await httpClient.get<unknown>(`/articles/${slug}`);
  return requireObjectResponse<ArticleResponse>(response.data, 'article');
}
