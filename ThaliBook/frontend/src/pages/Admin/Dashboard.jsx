// src/pages/Admin/Dashboard.jsx
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

export default function AdminDashboard() {
  const { user } = useSelector(state => state.auth);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <p>This is a placeholder for the admin dashboard.</p>
      </div>
    </div>
  );
}