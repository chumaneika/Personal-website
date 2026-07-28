import { useState, type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { isRouteErrorResponse, Links, Outlet, Scripts, ScrollRestoration } from 'react-router';
import type { Route } from './+types/root';
import './styles/main.scss';

function createQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  const [queryClient] = useState(createQueryClient);

  return (
    <QueryClientProvider client={queryClient}>
      <Outlet />
    </QueryClientProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let title = 'Page unavailable';
  let message = 'The requested page could not be loaded.';

  if (isRouteErrorResponse(error)) {
    title = error.status === 404 ? 'Page not found' : 'Page unavailable';
    message =
      typeof error.data === 'string'
        ? error.data
        : error.statusText || 'The requested page could not be loaded.';
  }

  return (
    <main className="surface-state">
      <title>{`${title} | Malik`}</title>
      <meta name="robots" content="noindex" />
      <h1>{title}</h1>
      <p>{message}</p>
      <a href="/">Return home</a>
    </main>
  );
}
