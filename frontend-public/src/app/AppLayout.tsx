import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router';
import type { Route } from './+types/AppLayout';
import { loadProfile } from '../shared/api/publicApi.server';
import { SocialLinks } from '../shared/components/SocialLinks';

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/projects', label: 'Projects' },
  { to: '/blog', label: 'Blog' },
  { to: '/skills', label: 'Skills' },
  { to: '/resume', label: 'Resume' },
  { to: '/contacts', label: 'Contacts' },
];

type Theme = 'light' | 'dark';

const themeStorageKey = 'public-theme';

function getBrowserTheme(): Theme {
  const storedTheme = (() => {
    try {
      return window.localStorage.getItem(themeStorageKey);
    } catch {
      return null;
    }
  })();

  if (storedTheme === 'light' || storedTheme === 'dark') {
    return storedTheme;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export async function loader({ request }: Route.LoaderArgs) {
  try {
    return { profile: await loadProfile(request.signal) };
  } catch {
    return { profile: null };
  }
}

export function AppLayout({ loaderData }: { loaderData: Route.ComponentProps['loaderData'] }) {
  const profile = loaderData.profile;
  const [theme, setTheme] = useState<Theme>('light');
  const [themeReady, setThemeReady] = useState(false);
  const year = new Date().getFullYear();
  const nextTheme = theme === 'light' ? 'dark' : 'light';

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      setTheme(getBrowserTheme());
      setThemeReady(true);
    });

    return () => window.cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!themeReady) {
      return;
    }

    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    try {
      window.localStorage.setItem(themeStorageKey, theme);
    } catch {
      // Theme still works for this session when storage is unavailable.
    }
  }, [theme, themeReady]);

  return (
    <div className="app-shell">
      <header className="site-header">
        <NavLink to="/" className="brand">
          Malik Alikberov
        </NavLink>
        <div className="site-header__actions">
          <nav className="site-nav" aria-label="Primary navigation">
            {navItems.map((item) => (
              <NavLink key={item.to} to={item.to} end={item.end}>
                {item.label}
              </NavLink>
            ))}
          </nav>
          <button
            className="theme-toggle"
            type="button"
            aria-label={`Switch to ${nextTheme} theme`}
            aria-pressed={theme === 'dark'}
            onClick={() => setTheme(nextTheme)}
          >
            <span className="theme-toggle__track" aria-hidden="true">
              <span className="theme-toggle__thumb" />
            </span>
            <span className="theme-toggle__label">{theme === 'dark' ? 'Dark' : 'Light'}</span>
          </button>
        </div>
      </header>
      <main>
        <Outlet />
      </main>
      <footer className="site-footer">
        <div>
          <strong>Malik Alikberov</strong>
          {profile?.email && <a href={`mailto:${profile.email}`}>{profile.email}</a>}
        </div>
        <SocialLinks profile={profile} />
        <div className="site-footer__meta">
          <Link to="/privacy">Privacy</Link>
          <p>{year}</p>
        </div>
      </footer>
    </div>
  );
}

export default AppLayout;
