import { ProjectRequest, ProjectResponse, PublicationStatus } from '../types/api';
import { httpClient } from './httpClient';

export async function fetchProjects(status?: PublicationStatus) {
  const response = await httpClient.get<ProjectResponse[]>('/admin/projects', {
    params: status ? { status } : undefined,
  });

  return response.data;
}

export async function fetchProject(id: number) {
  const response = await httpClient.get<ProjectResponse>(`/admin/projects/${id}`);
  return response.data;
}

export async function createProject(payload: ProjectRequest) {
  const response = await httpClient.post<ProjectResponse>('/admin/projects', payload);
  return response.data;
}

export async function updateProject(id: number, payload: ProjectRequest) {
  const response = await httpClient.put<ProjectResponse>(`/admin/projects/${id}`, payload);
  return response.data;
}

export async function updateProjectStatus(id: number, status: PublicationStatus) {
  const response = await httpClient.patch<ProjectResponse>(`/admin/projects/${id}/status`, { status });
  return response.data;
}

export async function deleteProject(id: number) {
  await httpClient.delete(`/admin/projects/${id}`);
}
