import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { type ReactElement } from 'react';
import { createMemoryRouter, type RouteObject, RouterProvider } from 'react-router-dom';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

export function renderPublicRoute(
  element: ReactElement,
  {
    route = '/',
    path = '*',
    routes,
  }: {
    route?: string;
    path?: string;
    routes?: RouteObject[];
  } = {},
) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        refetchOnWindowFocus: false,
      },
      mutations: {
        retry: false,
      },
    },
  });
  const defaultRoutes: RouteObject[] =
    path === '*'
      ? [{ path, element }]
      : [
          { path, element },
          { path: '*', element: <div /> },
        ];
  const router = createMemoryRouter(routes ?? defaultRoutes, {
    initialEntries: [route],
  });
  const view = render(
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>,
  );

  return {
    ...view,
    queryClient,
    router,
    user: userEvent.setup(),
  };
}
