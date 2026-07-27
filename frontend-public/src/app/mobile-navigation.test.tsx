import { screen } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AppLayout } from './AppLayout';
import { renderPublicRoute } from '../test/render';

const homeMocks = vi.hoisted(() => ({
  fetchHome: vi.fn(),
}));

vi.mock('../shared/api/home', () => homeMocks);

describe('primary mobile scenarios', () => {
  beforeEach(() => {
    Object.defineProperty(window, 'innerWidth', {
      configurable: true,
      value: 390,
    });
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockReturnValue({
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      }),
    });
    window.localStorage.clear();
    homeMocks.fetchHome.mockReset();
    homeMocks.fetchHome.mockResolvedValue({
      profile: null,
      projects: [],
      skills: [],
    });
  });

  it('keeps navigation and theme controls usable at a phone viewport', async () => {
    const { router, user } = renderPublicRoute(<div />, {
      route: '/',
      routes: [
        {
          path: '/',
          element: <AppLayout />,
          children: [
            { index: true, element: <h1>Mobile home</h1> },
            { path: 'projects', element: <h1>Mobile projects</h1> },
            { path: 'contacts', element: <h1>Mobile contacts</h1> },
          ],
        },
      ],
    });

    const navigation = screen.getByRole('navigation', { name: 'Primary navigation' });
    expect(navigation).toBeVisible();
    expect(screen.getByRole('link', { name: 'Projects' })).toBeVisible();

    await user.click(screen.getByRole('link', { name: 'Projects' }));
    expect(await screen.findByRole('heading', { name: 'Mobile projects' })).toBeInTheDocument();
    expect(router.state.location.pathname).toBe('/projects');

    await user.click(screen.getByRole('button', { name: 'Switch to dark theme' }));
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(window.localStorage.getItem('public-theme')).toBe('dark');

    await user.click(screen.getByRole('link', { name: 'Contacts' }));
    expect(await screen.findByRole('heading', { name: 'Mobile contacts' })).toBeInTheDocument();
  });
});
