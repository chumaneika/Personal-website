import type { HealthResponse } from '../types/api';
import { httpClient } from './httpClient';
import { requireObjectResponse } from './responseGuards';

export async function fetchHealth() {
  const response = await httpClient.get<unknown>('/health');
  return requireObjectResponse<HealthResponse>(response.data, 'health');
}
