// src/pages/Dashboard.jsx
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserBookings } from '@/store/thunks/bookingThunks';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { bookings, loading } = useSelector(state => state.booking);
  
  useEffect(() => {
    dispatch(fetchUserBookings());
  }, [dispatch]);
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">My Dashboard</h1>
      
      {bookings.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow-md">
          <p className="text-gray-500 mb-4">You don't have any reservations yet.</p>
          <Link to="/" className="text-blue-600 hover:underline">
            Find restaurants and make a reservation
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {/* Booking cards would be rendered here */}
          <p>Your bookings will appear here...</p>
        </div>
      )}
    </div>
  );
}