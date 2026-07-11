import axios from 'axios';
import { ProfileRequest, ProfileResponse } from '../types/api';
import { httpClient } from './httpClient';

export async function fetchProfile() {
  try {
    const response = await httpClient.get<ProfileResponse>('/admin/profile');
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error) && error.response?.status === 404) {
      return null;
    }

    throw error;
  }
}

export async function saveProfile(payload: ProfileRequest) {
  const response = await httpClient.put<ProfileResponse>('/admin/profile', payload);
  return response.data;
}
