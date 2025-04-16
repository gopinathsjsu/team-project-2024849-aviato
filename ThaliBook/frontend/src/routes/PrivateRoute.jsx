// src/routes/PrivateRoute.jsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function PrivateRoute() {
  const { isAuthenticated } = useSelector(state => state.auth);
  const location = useLocation();

  // If not authenticated, redirect to login page with return URL
  if (!isAuthenticated) {
    return <Navigate to={`/login?returnUrl=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  }

  // If authenticated, render the child routes
  return <Outlet />;
}