import { httpClient } from './httpClient';

export async function fetchHealth() {
  const response = await httpClient.get<unknown>('/health');
  return response.data;
}
