import type { EnumValuesResponse } from '../types/api';
import { httpClient } from './httpClient';
import { requireObjectResponse } from './responseGuards';

export async function fetchMetaEnums() {
  const response = await httpClient.get<unknown>('/meta/enums');
  const data = requireObjectResponse<EnumValuesResponse>(response.data, 'metadata');

  if (!Array.isArray(data.skillCategories)) {
    throw new Error('Invalid metadata response.');
  }

  return data;
}
