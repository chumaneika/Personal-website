import { AdminMeResponse } from '../types/api';
import { httpClient } from './httpClient';
import { clearStoredAuthHeader, storeAuthHeader } from './session';

type SignInCredentials = {
  email: string;
  password: string;
};

function toBase64(value: string) {
  const bytes = new TextEncoder().encode(value);
  let binaryValue = '';

  bytes.forEach((byte) => {
    binaryValue += String.fromCharCode(byte);
  });

  return window.btoa(binaryValue);
}

export function createBasicAuthHeader({ email, password }: SignInCredentials) {
  return `Basic ${toBase64(`${email}:${password}`)}`;
}

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
  const authHeader = createBasicAuthHeader(values);

  const response = await httpClient.get<unknown>('/admin/me', {
    headers: {
      Authorization: authHeader,
    },
  });

  if (!isAdminMeResponse(response.data)) {
    throw new Error('Admin session validation returned an unexpected response.');
  }

  storeAuthHeader(authHeader);

  return response.data;
}

export async function fetchCurrentAdmin() {
  const response = await httpClient.get<unknown>('/admin/me');

  if (!isAdminMeResponse(response.data)) {
    throw new Error('Admin session validation returned an unexpected response.');
  }

  return response.data;
}

export function clearAuthSession() {
  clearStoredAuthHeader();
}
