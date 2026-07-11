import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { queryClient } from '../shared/api/queryClient';
import { clearAuthSession } from '../shared/api/auth';

export function AdminLayout() {
  const navigate = useNavigate();

  function handleLogout() {
    clearAuthSession();
    queryClient.clear();
    navigate('/login', { replace: true });
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
          <NavLink to="/skills">Skills</NavLink>
          <NavLink to="/messages">Messages</NavLink>
          <NavLink to="/settings">Settings</NavLink>
        </nav>
        <button className="sidebar-logout" type="button" onClick={handleLogout}>
          Logout
        </button>
      </aside>
      <main className="admin-main">
        <Outlet />
      </main>
    </div>
  );
}
