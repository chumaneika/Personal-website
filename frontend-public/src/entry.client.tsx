import { StrictMode, startTransition } from 'react';
import { hydrateRoot, type RootOptions } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';

async function loadErrorMonitoringOptions(): Promise<RootOptions | undefined> {
  const dsn = import.meta.env.VITE_PUBLIC_SENTRY_DSN;

  if (!dsn?.trim()) {
    return undefined;
  }

  const { initializeErrorMonitoring } = await import('./shared/monitoring/errorMonitoring');

  return initializeErrorMonitoring({
    dsn,
    environment: import.meta.env.VITE_SENTRY_ENVIRONMENT,
    release: import.meta.env.VITE_RELEASE,
  });
}

async function hydrate() {
  const errorMonitoringRootOptions = await loadErrorMonitoringOptions();

  startTransition(() => {
    hydrateRoot(
      document,
      <StrictMode>
        <HydratedRouter />
      </StrictMode>,
      errorMonitoringRootOptions,
    );
  });
}

void hydrate();
