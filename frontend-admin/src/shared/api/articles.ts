import { ArticleRequest, ArticleResponse, PublicationStatus } from '../types/api';
import { httpClient } from './httpClient';

export async function fetchArticles(status?: PublicationStatus) {
  const response = await httpClient.get<ArticleResponse[]>('/admin/articles', {
    params: status ? { status } : undefined,
  });
  return response.data;
}

export async function fetchArticle(id: number) {
  const response = await httpClient.get<ArticleResponse>(`/admin/articles/${id}`);
  return response.data;
}

export async function createArticle(payload: ArticleRequest) {
  const response = await httpClient.post<ArticleResponse>('/admin/articles', payload);
  return response.data;
}

export async function updateArticle(id: number, payload: ArticleRequest) {
  const response = await httpClient.put<ArticleResponse>(`/admin/articles/${id}`, payload);
  return response.data;
}

export async function updateArticleStatus(id: number, status: PublicationStatus) {
  const response = await httpClient.patch<ArticleResponse>(`/admin/articles/${id}/status`, { status });
  return response.data;
}

export async function deleteArticle(id: number) {
  await httpClient.delete(`/admin/articles/${id}`);
}
