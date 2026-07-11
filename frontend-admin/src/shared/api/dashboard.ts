import { DashboardSummaryResponse } from '../types/api';
import { httpClient } from './httpClient';

export async function fetchDashboard() {
  const response = await httpClient.get<DashboardSummaryResponse>('/admin/dashboard');
  return response.data;
}
