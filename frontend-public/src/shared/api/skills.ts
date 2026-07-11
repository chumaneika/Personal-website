import type { SkillResponse } from '../types/api';
import { httpClient } from './httpClient';
import { requireArrayResponse } from './responseGuards';

export async function fetchSkills(categoryId?: number) {
  const response = await httpClient.get<unknown>('/skills', {
    params: categoryId ? { categoryId } : undefined,
  });

  return requireArrayResponse<SkillResponse>(response.data, 'skills');
}
