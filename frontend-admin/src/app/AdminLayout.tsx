import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { queryClient } from '../shared/api/queryClient';
import { signOut } from '../shared/api/auth';

export function AdminLayout() {
  const navigate = useNavigate();
  const logoutMutation = useMutation({
    mutationFn: signOut,
    onSuccess: () => {
      queryClient.clear();
      navigate('/login', { replace: true });
    },
  });

  function handleLogout() {
    logoutMutation.mutate();
  }

  return (
    <div className="admin-shell">
      <aside className="sidebar">
        <NavLink to="/" className="brand">
          Malik Admin
        </NavLink>
        <nav className="sidebar-nav" aria-label="Admin navigation">
          <NavLink to="/">Dashboard</NavLink>
          <NavLink to="/profile">Profile</NavLink>
          <NavLink to="/projects">Projects</NavLink>
          <NavLink to="/articles">Articles</NavLink>
          <NavLink to="/skills">Skills</NavLink>
          <NavLink to="/skill-categories">Categories</NavLink>
          <NavLink to="/messages">Messages</NavLink>
          <NavLink to="/settings">Settings</NavLink>
        </nav>
        <button
          className="sidebar-logout"
          type="button"
          disabled={logoutMutation.isPending}
          onClick={handleLogout}
        >
          {logoutMutation.isPending ? 'Logging out...' : 'Logout'}
        </button>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
