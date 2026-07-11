import type { HomeResponse } from '../types/api';
import { httpClient } from './httpClient';
import { requireObjectResponse } from './responseGuards';

export async function fetchHome() {
  const response = await httpClient.get<unknown>('/home');
  const data = requireObjectResponse<HomeResponse>(response.data, 'home');

  if (!Array.isArray(data.projects) || !Array.isArray(data.skills)) {
    throw new Error('Invalid home response.');
  }

  return data;
}
