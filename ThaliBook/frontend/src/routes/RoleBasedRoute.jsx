// src/routes/RoleBasedRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

export default function RoleBasedRoute({ role }) {
  const { isAuthenticated, user } = useAuth();
  const location = useLocation();

  // If not authenticated, redirect to login with return URL
  if (!isAuthenticated) {
    return <Navigate to={`/login?returnUrl=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  // If authenticated but wrong role, redirect based on user role
  if (user?.role !== role) {
    // Redirect based on user role
    switch (user?.role) {
      case 'CUSTOMER':
        return <Navigate to="/search" replace />;
      case 'RESTAURANT_MANAGER':
        return <Navigate to="/manager/dashboard" replace />;
      case 'ADMIN':
        return <Navigate to="/admin/dashboard" replace />;
      default:
        return <Navigate to="/dashboard" replace />;
    }
  }

  // If authenticated with correct role, render the child routes
  return <Outlet />;
}