import { MetaEnumsResponse } from '../types/api';
import { httpClient } from './httpClient';

export async function fetchMetaEnums() {
  const response = await httpClient.get<MetaEnumsResponse>('/meta/enums');
  return response.data;
}
