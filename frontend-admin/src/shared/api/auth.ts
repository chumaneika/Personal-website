import { type AdminMeResponse } from '../types/api';
import { httpClient, resetCsrfToken } from './httpClient';

type SignInCredentials = {
  email: string;
  password: string;
};

function isAdminMeResponse(value: unknown): value is AdminMeResponse {
  return (
    value !== null &&
    typeof value === 'object' &&
    'email' in value &&
    typeof value.email === 'string' &&
    'role' in value &&
    typeof value.role === 'string'
  );
}

export async function signIn(values: SignInCredentials) {
  const response = await httpClient.post<unknown>('/auth/login', values);

  if (!isAdminMeResponse(response.data)) {
    throw new Error('Admin session validation returned an unexpected response.');
  }

  return response.data;
}

export async function fetchCurrentAdmin() {
  const response = await httpClient.get<unknown>('/admin/me');

  if (!isAdminMeResponse(response.data)) {
    throw new Error('Admin session validation returned an unexpected response.');
  }

  return response.data;
}

export async function signOut() {
  await httpClient.post('/auth/logout');
  resetCsrfToken();
}

export async function changePassword(currentPassword: string, newPassword: string) {
  await httpClient.post('/admin/account/password', {
    currentPassword,
    newPassword,
  });
  resetCsrfToken();
}
