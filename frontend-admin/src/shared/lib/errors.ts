import axios from 'axios';

export function getApiErrorMessage(error: unknown, fallback = 'Request failed.') {
  if (!axios.isAxiosError(error)) {
    return fallback;
  }

  if (error.response?.status === 403) {
    return 'Forbidden. The current admin session does not have access to this action.';
  }

  const responseData = error.response?.data;

  if (typeof responseData === 'string' && responseData.trim().length > 0) {
    return responseData;
  }

  if (
    responseData &&
    typeof responseData === 'object' &&
    'message' in responseData &&
    typeof responseData.message === 'string'
  ) {
    return responseData.message;
  }

  return fallback;
}
