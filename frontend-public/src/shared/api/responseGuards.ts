function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function requireObjectResponse<T>(data: unknown, resourceName: string) {
  if (!isRecord(data)) {
    throw new Error(`Invalid ${resourceName} response.`);
  }

  return data as T;
}

export function requireArrayResponse<T>(data: unknown, resourceName: string) {
  if (!Array.isArray(data)) {
    throw new Error(`Invalid ${resourceName} response.`);
  }

  return data as T[];
}
