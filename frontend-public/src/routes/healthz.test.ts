import { afterEach, describe, expect, it, vi } from 'vitest';
import { loader } from './healthz';

describe('public frontend health check', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('is healthy when backend readiness succeeds', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(null, { status: 200 }));
    vi.stubGlobal('fetch', fetchMock);

    const response = await loader();

    expect(response.status).toBe(204);
    expect(response.headers.get('Cache-Control')).toBe('no-store');
    expect(fetchMock).toHaveBeenCalledWith(
      'http://localhost:8080/actuator/health/readiness',
      expect.objectContaining({
        headers: { Accept: 'application/json' },
        signal: expect.any(AbortSignal),
      }),
    );
  });

  it('is unavailable when backend readiness is down', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(null, { status: 503 })));

    expect((await loader()).status).toBe(503);
  });

  it('is unavailable when backend cannot be reached', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('connection refused')));

    expect((await loader()).status).toBe(503);
  });
});
