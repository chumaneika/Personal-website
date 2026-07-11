import { Navigate, Outlet } from 'react-router-dom';
import { hasStoredAuthHeader } from '../shared/api/session';

export function ProtectedRoute() {
  if (!hasStoredAuthHeader()) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export function LoginRoute() {
  if (hasStoredAuthHeader()) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
