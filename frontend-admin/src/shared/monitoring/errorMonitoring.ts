import * as Sentry from '@sentry/react';
import type { RootOptions } from 'react-dom/client';

export interface ErrorMonitoringConfig {
  dsn?: string;
  environment?: string;
  release?: string;
}

const normalizeMetadata = (value?: string): string | undefined => {
  const normalizedValue = value?.trim();
  return normalizedValue || undefined;
};

export const initializeErrorMonitoring = ({
  dsn,
  environment,
  release,
}: ErrorMonitoringConfig): RootOptions | undefined => {
  const normalizedDsn = normalizeMetadata(dsn);

  if (!normalizedDsn) {
    return undefined;
  }

  const globalHandlers = Sentry.globalHandlersIntegration({
    onerror: true,
    onunhandledrejection: true,
  });

  Sentry.init({
    dsn: normalizedDsn,
    environment: normalizeMetadata(environment),
    release: normalizeMetadata(release),
    sendDefaultPii: false,
    integrations: (defaultIntegrations) => [
      ...defaultIntegrations.filter(({ name }) => name !== 'GlobalHandlers'),
      globalHandlers,
    ],
  });

  return {
    onCaughtError: Sentry.reactErrorHandler(),
    onRecoverableError: Sentry.reactErrorHandler(),
    onUncaughtError: Sentry.reactErrorHandler(),
  };
};
