import axios from 'axios';

export function isNotFoundError(error: unknown) {
  return axios.isAxiosError(error) && error.response?.status === 404;
}
