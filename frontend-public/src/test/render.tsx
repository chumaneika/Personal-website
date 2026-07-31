import { type ReactElement } from 'react';
import { createMemoryRouter, type RouteObject, RouterProvider } from 'react-router';
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
  const view = render(<RouterProvider router={router} />);

  return {
    ...view,
    router,
    user: userEvent.setup(),
  };
}
