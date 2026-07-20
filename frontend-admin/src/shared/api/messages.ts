import { ContactMessageResponse, ContactMessageStatus, PageResponse } from '../types/api';
import { httpClient } from './httpClient';

export async function fetchContactMessages(status?: ContactMessageStatus, page = 0, size = 20) {
  const response = await httpClient.get<PageResponse<ContactMessageResponse>>('/admin/contact-messages', {
    params: { status, page, size },
  });

  return response.data;
}

export async function deleteContactMessage(id: number) {
  await httpClient.delete(`/admin/contact-messages/${id}`);
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
