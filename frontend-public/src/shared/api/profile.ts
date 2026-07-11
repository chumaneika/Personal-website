import type { ProfileResponse } from '../types/api';
import { httpClient } from './httpClient';
import { requireObjectResponse } from './responseGuards';

export async function fetchProfile() {
  const response = await httpClient.get<unknown>('/profile');
  return requireObjectResponse<ProfileResponse>(response.data, 'profile');
}
