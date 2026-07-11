import { ContactMessageResponse, ContactMessageStatus } from '../types/api';
import { httpClient } from './httpClient';

export async function fetchContactMessages(status?: ContactMessageStatus) {
  const response = await httpClient.get<ContactMessageResponse[]>('/admin/contact-messages', {
    params: status ? { status } : undefined,
  });

  return response.data;
}

export async function fetchContactMessage(id: number) {
  const response = await httpClient.get<ContactMessageResponse>(`/admin/contact-messages/${id}`);
  return response.data;
}

export async function updateContactMessageStatus(id: number, status: ContactMessageStatus) {
  const response = await httpClient.patch<ContactMessageResponse>(`/admin/contact-messages/${id}/status`, {
    status,
  });

  return response.data;
}
