import type { SkillCategoryResponse } from '../types/api';
import { httpClient } from './httpClient';

export async function fetchSkillCategories() {
  const response = await httpClient.get<unknown>('/skill-categories');

  if (!Array.isArray(response.data)) {
    throw new Error('Invalid skill categories response.');
  }

  return response.data as SkillCategoryResponse[];
}
