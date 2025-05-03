// src/AppRouter.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import SearchRestaurants from './pages/SearchRestaurants';
import ProtectedRoute from './components/ProtectedRoute';

function Home() {
  return <h2>Home Page</h2>;
}

function AdminDashboard() {
  return <h2>Admin Dashboard</h2>;
}

function ManagerDashboard() {
  return <h2>Restaurant Manager Dashboard</h2>;
}

export default function AppRouter() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/search"
          element={
            <ProtectedRoute allowedRoles={['CUSTOMER']}>
              <SearchRestaurants />
            </ProtectedRoute>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['ADMIN']}>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/manager"
          element={
            <ProtectedRoute allowedRoles={['RESTAURANT_MANAGER']}>
              <ManagerDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}
