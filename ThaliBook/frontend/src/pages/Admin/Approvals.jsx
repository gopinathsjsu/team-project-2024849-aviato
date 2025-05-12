// src/pages/Admin/Approvals.jsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import { useSelector } from 'react-redux';
import { Button } from '@/components/ui/button';
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
      console.error('Failed to fetch restaurants:', err);
    }
  };

  const handleDelete = async (id, name) => {
    try {
      await axios.delete(`http://localhost:8080/api/restaurants/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success(`${name} removed successfully`);
      fetchRestaurants();
    } catch (err) {
      console.error('Failed to delete restaurant:', err);
      toast.error('Delete failed');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">All Restaurant Listings</h1>
      {restaurants.length > 0 ? (
        <ul className="space-y-4">
          {restaurants.map((rest) => (
            <li key={rest.restaurantId} className="border p-4 rounded-md shadow-sm bg-white">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-bold">{rest.name}</h3>
                  <p className="text-sm text-gray-600">{rest.address}, {rest.city}</p>
                </div>
                <Button
                  onClick={() => handleDelete(rest.restaurantId, rest.name)}
                  variant="destructive"
                >
                  Remove Restaurant Listing
                </Button>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-gray-600">No restaurants found.</p>
      )}
    </div>
  );
}
