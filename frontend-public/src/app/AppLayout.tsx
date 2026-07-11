import { useLayoutEffect, useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { fetchProfile } from '../shared/api/profile';
import { SocialLinks } from '../shared/components/SocialLinks';

const navItems = [
  { to: '/', label: 'Home', end: true },
  { to: '/about', label: 'About' },
  { to: '/projects', label: 'Projects' },
  { to: '/skills', label: 'Skills' },
  { to: '/resume', label: 'Resume' },
  { to: '/contacts', label: 'Contacts' },
];

type Theme = 'light' | 'dark';

const themeStorageKey = 'public-theme';

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') {
    return 'light';
  }

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

export function AppLayout() {
  const profileQuery = useQuery({
    queryKey: ['profile'],
    queryFn: fetchProfile,
  });
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const year = new Date().getFullYear();
  const nextTheme = theme === 'light' ? 'dark' : 'light';

  useLayoutEffect(() => {
    document.documentElement.dataset.theme = theme;
    document.documentElement.style.colorScheme = theme;
    try {
      window.localStorage.setItem(themeStorageKey, theme);
    } catch {
      // Theme still works for this session when storage is unavailable.
    }
  }, [theme]);

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
          {profileQuery.data?.email && <a href={`mailto:${profileQuery.data.email}`}>{profileQuery.data.email}</a>}
        </div>
        <SocialLinks profile={profileQuery.data} />
        <p>{year}</p>
      </footer>
    </div>
  );
}
