import { getBackendReadinessUrl } from '../shared/config/runtime.server';

const HEALTH_CHECK_TIMEOUT_MS = 2_500;
const HEALTH_CHECK_HEADERS = {
  'Cache-Control': 'no-store',
};

export async function loader() {
  try {
    const response = await fetch(getBackendReadinessUrl(), {
      headers: {
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(HEALTH_CHECK_TIMEOUT_MS),
    });

    return new Response(null, {
      status: response.ok ? 204 : 503,
      headers: HEALTH_CHECK_HEADERS,
    });
  } catch {
    return new Response(null, {
      status: 503,
      headers: HEALTH_CHECK_HEADERS,
    });
  }
}
