import { screen, waitFor } from '@testing-library/react';
import { Outlet } from 'react-router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AdminLayout } from './AdminLayout';
import { LoginRoute, ProtectedRoute } from './RouteGuards';
import { LoginPage } from '../pages/LoginPage';
import { renderAdminRoute } from '../test/render';

const authMocks = vi.hoisted(() => ({
  fetchCurrentAdmin: vi.fn(),
  signIn: vi.fn(),
  signOut: vi.fn(),
}));

vi.mock('../shared/api/auth', () => authMocks);

function authRoutes() {
  return [
    {
      element: <LoginRoute />,
      children: [{ path: '/login', element: <LoginPage /> }],
    },
    {
      element: <ProtectedRoute />,
      children: [
        {
          element: <AdminLayout />,
          children: [{ path: '*', element: <h1>Admin dashboard</h1> }],
        },
      ],
    },
    {
      path: '/standalone',
      element: <Outlet />,
    },
  ];
}

describe('admin authentication and route protection', () => {
  beforeEach(() => {
    authMocks.fetchCurrentAdmin.mockReset();
    authMocks.signIn.mockReset();
    authMocks.signOut.mockReset();
  });

  it('redirects an unauthenticated visitor from a protected route to login', async () => {
    authMocks.fetchCurrentAdmin.mockRejectedValue(new Error('Unauthorized'));

    const { router } = renderAdminRoute(<div />, {
      route: '/projects',
      routes: authRoutes(),
    });

    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
  });

  it('redirects an authenticated admin away from the login page', async () => {
    authMocks.fetchCurrentAdmin.mockResolvedValue({
      email: 'admin@example.com',
      role: 'ADMIN',
    });

    const { router } = renderAdminRoute(<div />, {
      route: '/login',
      routes: authRoutes(),
    });

    expect(await screen.findByRole('heading', { name: 'Admin dashboard' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/');
  });

  it('signs in and stores the authenticated route state', async () => {
    const admin = {
      email: 'admin@example.com',
      role: 'ADMIN',
    };
    authMocks.fetchCurrentAdmin
      .mockRejectedValueOnce(new Error('Unauthorized'))
      .mockResolvedValue(admin);
    authMocks.signIn.mockResolvedValue(admin);

    const { router, user } = renderAdminRoute(<div />, {
      route: '/login',
      routes: authRoutes(),
    });

    await user.type(await screen.findByLabelText('Email'), 'admin@example.com');
    await user.type(screen.getByLabelText('Password'), 'correct-password');
    await user.click(screen.getByRole('button', { name: 'Sign in' }));

    await waitFor(() => {
      expect(authMocks.signIn.mock.calls[0]?.[0]).toEqual({
        email: 'admin@example.com',
        password: 'correct-password',
      });
    });
    expect(await screen.findByRole('heading', { name: 'Admin dashboard' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/');
  });

  it('signs out from the admin layout and returns to login', async () => {
    authMocks.fetchCurrentAdmin
      .mockResolvedValueOnce({ email: 'admin@example.com', role: 'ADMIN' })
      .mockRejectedValue(new Error('Unauthorized'));
    authMocks.signOut.mockResolvedValue(undefined);

    const { router, user } = renderAdminRoute(<div />, {
      route: '/',
      routes: authRoutes(),
    });

    await user.click(await screen.findByRole('button', { name: 'Logout' }));

    await waitFor(() => expect(authMocks.signOut).toHaveBeenCalledOnce());
    expect(await screen.findByRole('heading', { name: 'Sign in' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/login');
  });

  it('keeps the main admin navigation usable at a phone viewport', async () => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 390,
    });
    authMocks.fetchCurrentAdmin.mockResolvedValue({
      email: 'admin@example.com',
      role: 'ADMIN',
    });

    const { router, user } = renderAdminRoute(<div />, {
      route: '/',
      routes: authRoutes(),
    });

    const navigation = await screen.findByRole('navigation', { name: 'Admin navigation' });
    expect(navigation).toBeVisible();
    await user.click(screen.getByRole('link', { name: 'Projects' }));
    expect(router.state.location.pathname).toBe('/projects');
    await user.click(screen.getByRole('link', { name: 'Messages' }));
    expect(router.state.location.pathname).toBe('/messages');
  });
});
