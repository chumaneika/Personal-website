import axios from 'axios';
import { queryClient } from './queryClient';
import { clearStoredAuthHeader, getStoredAuthHeader } from './session';

export const apiBaseUrl = import.meta.env.VITE_ADMIN_API_URL ?? '/api';

export const httpClient = axios.create({
  baseURL: apiBaseUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

httpClient.interceptors.request.use((config) => {
  const authHeader = getStoredAuthHeader();

  if (authHeader && !config.headers.Authorization) {
    config.headers.Authorization = authHeader;
  }

  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      clearStoredAuthHeader();
      queryClient.clear();

      if (window.location.pathname !== '/login') {
        window.location.assign('/login');
      }
    }

    return Promise.reject(error);
  },
);
