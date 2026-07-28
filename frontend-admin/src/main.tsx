import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router-dom';
import { queryClient } from './shared/api/queryClient';
import { initializeErrorMonitoring } from './shared/monitoring/errorMonitoring';
import { router } from './app/router';
import './styles/main.scss';

const errorMonitoringRootOptions = initializeErrorMonitoring({
  dsn: import.meta.env.VITE_ADMIN_SENTRY_DSN,
  environment: import.meta.env.VITE_SENTRY_ENVIRONMENT,
  release: import.meta.env.VITE_RELEASE,
});

createRoot(document.getElementById('root')!, errorMonitoringRootOptions).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
