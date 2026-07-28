import type {
  ArticleResponse,
  ArticleSummaryResponse,
  HomeResponse,
  ProfileResponse,
  ProjectResponse,
  ProjectSummaryResponse,
  SkillCategoryResponse,
  SkillResponse,
} from '../types/api';
import { getBackendInternalUrl } from '../config/runtime.server';
import { requireArrayResponse, requireObjectResponse } from './responseGuards';

export class PublicApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = 'PublicApiError';
  }
}

async function request(path: string, signal?: AbortSignal) {
  const response = await fetch(`${getBackendInternalUrl()}${path}`, {
    headers: {
      Accept: 'application/json',
    },
    signal,
  });

  if (!response.ok) {
    throw new PublicApiError(response.status, `Public API request failed with ${response.status}.`);
  }

  return response.json() as Promise<unknown>;
}

export async function loadHome(signal?: AbortSignal) {
  const data = requireObjectResponse<HomeResponse>(await request('/home', signal), 'home');

  if (!Array.isArray(data.projects) || !Array.isArray(data.skills)) {
    throw new Error('Invalid home response.');
  }

  return data;
}

export async function loadProfile(signal?: AbortSignal) {
  try {
    return requireObjectResponse<ProfileResponse>(await request('/profile', signal), 'profile');
  } catch (error) {
    if (error instanceof PublicApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

export async function loadProjects(signal?: AbortSignal) {
  return requireArrayResponse<ProjectSummaryResponse>(
    await request('/projects', signal),
    'projects',
  );
}

export async function loadProject(slug: string, signal?: AbortSignal) {
  return requireObjectResponse<ProjectResponse>(
    await request(`/projects/${encodeURIComponent(slug)}`, signal),
    'project',
  );
}

export async function loadArticles(signal?: AbortSignal) {
  return requireArrayResponse<ArticleSummaryResponse>(
    await request('/articles', signal),
    'articles',
  );
}

export async function loadArticle(slug: string, signal?: AbortSignal) {
  return requireObjectResponse<ArticleResponse>(
    await request(`/articles/${encodeURIComponent(slug)}`, signal),
    'article',
  );
}

export async function loadSkills(categoryId?: number, signal?: AbortSignal) {
  const url = new URL(`${getBackendInternalUrl()}/skills`);
  if (categoryId) {
    url.searchParams.set('categoryId', String(categoryId));
  }

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
    signal,
  });

  if (!response.ok) {
    throw new PublicApiError(response.status, `Public API request failed with ${response.status}.`);
  }

  return requireArrayResponse<SkillResponse>(await response.json(), 'skills');
}

export async function loadSkillCategories(signal?: AbortSignal) {
  return requireArrayResponse<SkillCategoryResponse>(
    await request('/skill-categories', signal),
    'skill categories',
  );
}
