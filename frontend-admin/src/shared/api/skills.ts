import { SkillRequest, SkillResponse } from '../types/api';
import { httpClient } from './httpClient';

export async function fetchSkills() {
  const response = await httpClient.get<SkillResponse[]>('/admin/skills');
  return response.data;
}

export async function fetchSkill(id: number) {
  const response = await httpClient.get<SkillResponse>(`/admin/skills/${id}`);
  return response.data;
}

export async function createSkill(payload: SkillRequest) {
  const response = await httpClient.post<SkillResponse>('/admin/skills', payload);
  return response.data;
}

export async function updateSkill(id: number, payload: SkillRequest) {
  const response = await httpClient.put<SkillResponse>(`/admin/skills/${id}`, payload);
  return response.data;
}

export async function updateSkillVisibility(id: number, visible: boolean) {
  const response = await httpClient.patch<SkillResponse>(`/admin/skills/${id}/visibility`, { visible });
  return response.data;
}

export async function deleteSkill(id: number) {
  await httpClient.delete(`/admin/skills/${id}`);
}
