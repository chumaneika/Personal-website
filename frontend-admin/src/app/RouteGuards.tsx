import { Navigate, Outlet } from 'react-router';
import { useQuery } from '@tanstack/react-query';
import { fetchCurrentAdmin } from '../shared/api/auth';

export function ProtectedRoute() {
  const adminQuery = useQuery({
    queryKey: ['current-admin'],
    queryFn: fetchCurrentAdmin,
    retry: false,
  });

  if (adminQuery.isPending) {
    return <p className="surface-state">Checking admin session...</p>;
  }

  if (adminQuery.isError) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

export function LoginRoute() {
  const adminQuery = useQuery({
    queryKey: ['current-admin'],
    queryFn: fetchCurrentAdmin,
    retry: false,
  });

  if (adminQuery.isPending) {
    return <p className="surface-state">Checking admin session...</p>;
  }

  if (adminQuery.isSuccess) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
}
