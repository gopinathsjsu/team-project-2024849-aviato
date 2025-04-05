// src/components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';

export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem('token');
  const storedRole = localStorage.getItem('role');

  if (!token) {
    console.warn('🔐 No token found — redirecting to login');
    return <Navigate to="/login" replace />;
  }

  try {
    const decoded = jwtDecode(token);
    const userRole = decoded?.role || storedRole;  // ⬅️ updated line
    console.log('🔐 Role in ProtectedRoute:', userRole);

    if (allowedRoles.includes(userRole)) {
      return children;
    } else {
      console.warn('⛔ Role not allowed:', userRole);
      return <Navigate to="/login" replace />;
    }
  } catch (e) {
    console.error('❌ Error decoding token in ProtectedRoute', e);
    return <Navigate to="/login" replace />;
  }
}
