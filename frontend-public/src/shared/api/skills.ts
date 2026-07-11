import type { SkillCategory, SkillResponse } from '../types/api';
import { httpClient } from './httpClient';
import { requireArrayResponse } from './responseGuards';

export async function fetchSkills(category?: SkillCategory) {
  const response = await httpClient.get<unknown>('/skills', {
    params: category ? { category } : undefined,
  });

  return requireArrayResponse<SkillResponse>(response.data, 'skills');
}
