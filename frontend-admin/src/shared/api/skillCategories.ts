import { SkillCategoryRequest, SkillCategoryResponse } from '../types/api';
import { httpClient } from './httpClient';

export async function fetchSkillCategories() {
  const response = await httpClient.get<SkillCategoryResponse[]>('/admin/skill-categories');
  return response.data;
}

export async function fetchSkillCategory(id: number) {
  const response = await httpClient.get<SkillCategoryResponse>(`/admin/skill-categories/${id}`);
  return response.data;
}

export async function createSkillCategory(payload: SkillCategoryRequest) {
  const response = await httpClient.post<SkillCategoryResponse>('/admin/skill-categories', payload);
  return response.data;
}

export async function updateSkillCategory(id: number, payload: SkillCategoryRequest) {
  const response = await httpClient.put<SkillCategoryResponse>(`/admin/skill-categories/${id}`, payload);
  return response.data;
}

export async function deleteSkillCategory(id: number) {
  await httpClient.delete(`/admin/skill-categories/${id}`);
}
