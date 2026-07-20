import axios from 'axios';
import type { ProfileResponse } from '../types/api';
import { httpClient } from './httpClient';
import { requireObjectResponse } from './responseGuards';

export async function fetchProfile() {
  try {
    const response = await httpClient.get<unknown>('/profile');
    return requireObjectResponse<ProfileResponse>(response.data, 'profile');
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }

    throw error;
  }
}
