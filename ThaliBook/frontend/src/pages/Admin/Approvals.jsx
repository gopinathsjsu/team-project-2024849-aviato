// src/pages/Admin/Approvals.jsx
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { toast } from 'sonner';

export default function Approvals() {
  const { token } = useSelector(state => state.auth);
  const [restaurants, setRestaurants] = useState([]);

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const res = await axios.get('http://localhost:8080/api/admin/getAllRestaurants', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRestaurants(res.data);
    } catch (err) {
      console.error('Failed to fetch all restaurants:', err);
    }
  };

  const handleRemove = async (id, name) => {
    const confirmDelete = window.confirm(`Are you sure you want to remove ${name}?`);
    if (!confirmDelete) return;

    try {
      await axios.delete(`http://localhost:8080/api/restaurants/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`${name} removed successfully`);
      fetchRestaurants();
    } catch (err) {
      console.error(`Failed to remove ${name}:`, err);
      toast.error(`Failed to remove ${name}`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">All Restaurants</h1>

      {restaurants.length === 0 ? (
        <p className="text-gray-600">No restaurants found.</p>
      ) : (
        <ul className="space-y-4">
          {restaurants.map((rest) => (
            <li
              key={rest.restaurantId}
              className="border p-4 rounded-md shadow-sm flex justify-between items-center"
            >
              <div>
                <h3 className="text-lg font-bold">{rest.name}</h3>
                <p className="text-sm text-gray-600">
                  {rest.address}, {rest.city}
                </p>
              </div>
              <button
                onClick={() => handleRemove(rest.restaurantId, rest.name)}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-2 px-4 rounded transition duration-150"
              >
                Remove Restaurant Listing
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
