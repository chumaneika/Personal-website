const DEFAULT_BACKEND_URL = 'http://localhost:8080/api';
const DEFAULT_SITE_ORIGIN = 'http://localhost:5173';

function normalizeAbsoluteHttpUrl(value: string, variableName: string) {
  let url: URL;

  try {
    url = new URL(value);
  } catch {
    throw new Error(`${variableName} must be an absolute URL.`);
  }

  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new Error(`${variableName} must use http or https.`);
  }

  return url.toString().replace(/\/+$/, '');
}

export function getBackendInternalUrl() {
  return normalizeAbsoluteHttpUrl(
    process.env.PUBLIC_BACKEND_INTERNAL_URL?.trim() || DEFAULT_BACKEND_URL,
    'PUBLIC_BACKEND_INTERNAL_URL',
  );
}

export function getPublicSiteOrigin() {
  return normalizeAbsoluteHttpUrl(
    process.env.PUBLIC_SITE_ORIGIN?.trim() || DEFAULT_SITE_ORIGIN,
    'PUBLIC_SITE_ORIGIN',
  );
}
