import { QueryClientProvider } from '@tanstack/react-query';
import { type ReactElement } from 'react';
import { createMemoryRouter, type RouteObject, RouterProvider } from 'react-router';
import { render } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { queryClient } from '../shared/api/queryClient';

export function resetAdminQueryClient() {
  queryClient.clear();
  queryClient.setDefaultOptions({
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: false,
    },
  });
}

export function renderAdminRoute(
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
  resetAdminQueryClient();
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
    router,
    user: userEvent.setup(),
  };
}
