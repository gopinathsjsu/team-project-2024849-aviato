import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '@/services/api';
import { Link } from 'react-router-dom';

export default function ManagerDashboard() {
  const { user } = useSelector((state) => state.auth);
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    const fetchRestaurants = async () => {
      try {
        const response = await api.get('/restaurants/manager');
        const approved = response.data.filter((r) => r.isApproved);
        setRestaurants(approved);
      } catch (err) {
        console.error("Failed to fetch manager's restaurants:", err);
      }
    };

    fetchRestaurants();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Welcome, {user?.name || 'Manager'}!</h1>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Your Restaurants</h2>
        {restaurants.length === 0 ? (
          <p className="text-gray-600">You don't have any approved restaurants yet.</p>
        ) : (
          <ul className="space-y-4">
            {restaurants.map((rest) => (
              <li key={rest.restaurantId} className="border p-4 rounded-md shadow-sm">
                <h3 className="text-lg font-bold">{rest.name}</h3>
                <p className="text-sm text-gray-600">{rest.address}, {rest.city}</p>
                <div className="mt-2 flex gap-4">
                  <Link
                    to={`/manager/restaurant/edit/${rest.restaurantId}`}
                    className="text-blue-600 hover:underline"
                  >
                    Edit Details
                  </Link>
                  <Link to="/manager/bookings" className="text-orange-600 hover:underline">
                    Manage Bookings
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
