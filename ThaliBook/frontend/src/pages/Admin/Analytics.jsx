// src/pages/Admin/Analytics.jsx
import { useEffect } from 'react';
import { useSelector } from 'react-redux';

export default function Analytics() {
  const { user } = useSelector(state => state.auth);
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6">
        <p>This is a placeholder for the analytics dashboard.</p>
      </div>
    </div>
  );
}