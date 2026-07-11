import type { ContactMessageRequest, ContactMessageResponse } from '../types/api';
import { httpClient } from './httpClient';
import { requireObjectResponse } from './responseGuards';

export async function sendContactMessage(values: ContactMessageRequest) {
  const response = await httpClient.post<unknown>('/contact-messages', values);
  return requireObjectResponse<ContactMessageResponse>(response.data, 'contact message');
}
