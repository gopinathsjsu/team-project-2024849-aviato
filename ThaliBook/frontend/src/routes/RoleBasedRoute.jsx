// src/routes/RoleBasedRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useSelector } from 'react-redux';

export default function RoleBasedRoute({ role }) {
  const { isAuthenticated, user } = useSelector(state => state.auth);

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // If authenticated but wrong role, redirect to dashboard
  if (user.role !== role) {
    return <Navigate to="/dashboard" replace />;
  }

  // If authenticated with correct role, render the child routes
  return <Outlet />;
}