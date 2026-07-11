const AUTH_HEADER_KEY = 'malik-admin-basic-auth';

export function getStoredAuthHeader() {
  if (typeof window === 'undefined') {
    return null;
  }

  return window.sessionStorage.getItem(AUTH_HEADER_KEY);
}

export function hasStoredAuthHeader() {
  return Boolean(getStoredAuthHeader());
}

export function storeAuthHeader(authHeader: string) {
  window.sessionStorage.setItem(AUTH_HEADER_KEY, authHeader);
}

export function clearStoredAuthHeader() {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.removeItem(AUTH_HEADER_KEY);
}
