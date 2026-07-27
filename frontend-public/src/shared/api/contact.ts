import type { ContactMessageRequest, ContactMessageResponse } from '../types/api';
import { httpClient } from './httpClient';
import { requireObjectResponse } from './responseGuards';

export async function sendContactMessage(values: ContactMessageRequest) {
  const response = await httpClient.post<unknown>('/contact-messages', values);
  if (response.status === 202 || response.data == null || response.data === '') {
    return null;
  }
  return requireObjectResponse<ContactMessageResponse>(response.data, 'contact message');
}
