import axios from 'axios';

export const httpClient = axios.create({
  baseURL: import.meta.env.VITE_PUBLIC_API_URL ?? '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});
