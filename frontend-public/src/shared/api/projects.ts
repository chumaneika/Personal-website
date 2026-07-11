import type { ProjectResponse, ProjectSummaryResponse } from '../types/api';
import { httpClient } from './httpClient';
import { requireArrayResponse, requireObjectResponse } from './responseGuards';

export async function fetchProjects() {
  const response = await httpClient.get<unknown>('/projects');
  return requireArrayResponse<ProjectSummaryResponse>(response.data, 'projects');
}

export async function fetchProjectBySlug(slug: string) {
  const response = await httpClient.get<unknown>(`/projects/${slug}`);
  return requireObjectResponse<ProjectResponse>(response.data, 'project');
}
