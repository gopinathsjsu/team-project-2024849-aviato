// src/routes/PrivateRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function PrivateRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // If not authenticated, redirect to login page with return URL
  if (!isAuthenticated) {
    return <Navigate to={`/login?returnUrl=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
}