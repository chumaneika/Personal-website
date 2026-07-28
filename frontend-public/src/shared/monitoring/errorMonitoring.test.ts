import * as Sentry from '@sentry/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { initializeErrorMonitoring } from './errorMonitoring';

vi.mock('@sentry/react', () => ({
  globalHandlersIntegration: vi.fn(() => ({ name: 'GlobalHandlers' })),
  init: vi.fn(),
  reactErrorHandler: vi.fn(() => vi.fn()),
}));

describe('initializeErrorMonitoring', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('is a no-op when the public Sentry DSN is absent', () => {
    expect(initializeErrorMonitoring({ dsn: '   ' })).toBeUndefined();
    expect(Sentry.init).not.toHaveBeenCalled();
    expect(Sentry.globalHandlersIntegration).not.toHaveBeenCalled();
    expect(Sentry.reactErrorHandler).not.toHaveBeenCalled();
  });

  it('initializes runtime error monitoring with deployment metadata', () => {
    const rootOptions = initializeErrorMonitoring({
      dsn: ' https://public.example/123 ',
      environment: ' production ',
      release: ' 2026.07.28 ',
    });

    expect(Sentry.globalHandlersIntegration).toHaveBeenCalledWith({
      onerror: true,
      onunhandledrejection: true,
    });
    expect(Sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: 'https://public.example/123',
        environment: 'production',
        release: '2026.07.28',
        sendDefaultPii: false,
      }),
    );
    expect(Sentry.reactErrorHandler).toHaveBeenCalledTimes(3);
    expect(rootOptions).toEqual({
      onCaughtError: expect.any(Function),
      onRecoverableError: expect.any(Function),
      onUncaughtError: expect.any(Function),
    });
  });
});
