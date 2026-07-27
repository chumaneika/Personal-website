import axios from 'axios';
import { queryClient } from './queryClient';

export const apiBaseUrl = import.meta.env.VITE_ADMIN_API_URL ?? '/api';

export const httpClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

type CsrfTokenResponse = {
  token: string;
  headerName: string;
};

let csrfTokenPromise: Promise<CsrfTokenResponse> | null = null;

export function resetCsrfToken() {
  csrfTokenPromise = null;
}

async function getCsrfToken() {
  if (!csrfTokenPromise) {
    csrfTokenPromise = httpClient
      .get<CsrfTokenResponse>('/auth/csrf')
      .then((response) => response.data)
      .catch((error) => {
        csrfTokenPromise = null;
        throw error;
      });
  }

  return csrfTokenPromise;
}

httpClient.interceptors.request.use(async (config) => {
  const method = config.method?.toUpperCase() ?? 'GET';
  const needsCsrfToken = !['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(method);

  if (needsCsrfToken) {
    const csrf = await getCsrfToken();
    config.headers.set(csrf.headerName, csrf.token);
  }

  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      queryClient.clear();

      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }

    if (axios.isAxiosError(error) && error.response?.status === 403) {
      const message =
        error.response.data &&
        typeof error.response.data === 'object' &&
        'message' in error.response.data &&
        typeof error.response.data.message === 'string'
          ? error.response.data.message
          : '';

      if (message.includes('CSRF')) {
        resetCsrfToken();
      }
    }

    return Promise.reject(error);
  },
);
