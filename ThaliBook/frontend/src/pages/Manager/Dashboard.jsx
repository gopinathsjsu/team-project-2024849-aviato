import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '@/services/api';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

export default function ManagerDashboard() {
  const { user, token } = useSelector((state) => state.auth);
  const [restaurants, setRestaurants] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '', address: '', city: '', state: '', zipCode: '', phone: '',
    cuisine: '', costRating: '', description: '', photoUrl: '',
    hours: { Mon: '', Tue: '', Wed: '', Thu: '', Fri: '', Sat: '', Sun: '' },
    tables: { 2: '', 4: '', 6: '' }
  });

  useEffect(() => {
    fetchRestaurants();
  }, []);

  const fetchRestaurants = async () => {
    try {
      const response = await api.get('/restaurants/manager', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRestaurants(response.data);
    } catch (err) {
      console.error("Failed to fetch manager's restaurants:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('hours.')) {
      const day = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        hours: { ...prev.hours, [day]: value }
      }));
    } else if (name.startsWith('tables.')) {
      const size = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        tables: { ...prev.tables, [size]: parseInt(value) || '' }
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleAddRestaurant = async (e) => {
    e.preventDefault();
    try {
      await api.post('/restaurants', form, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('Restaurant added! Pending admin approval.');
      setShowModal(false);
      setForm({
        name: '', address: '', city: '', state: '', zipCode: '', phone: '',
        cuisine: '', costRating: '', description: '', photoUrl: '',
        hours: { Mon: '', Tue: '', Wed: '', Thu: '', Fri: '', Sat: '', Sun: '' },
        tables: { 2: '', 4: '', 6: '' }
      });
      fetchRestaurants();
    } catch (err) {
      console.error('Failed to add restaurant:', err);
      toast.error('Error adding restaurant');
    }
  };

  const approvedRestaurants = restaurants.filter(r => r.isApproved);
  const pendingRestaurants = restaurants.filter(r => !r.isApproved);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Welcome, {user?.name || 'Manager'}!</h1>
        <Button onClick={() => setShowModal(true)} className="bg-orange-600 hover:bg-orange-700">
          + Add New Restaurant
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Your Approved Restaurants</h2>
        {approvedRestaurants.length === 0 ? (
          <p className="text-gray-600">You don't have any approved restaurants yet.</p>
        ) : (
          <ul className="space-y-4">
            {approvedRestaurants.map((rest) => (
              <li key={rest.restaurantId} className="border p-4 rounded-md shadow-sm">
                <h3 className="text-lg font-bold">{rest.name}</h3>
                <p className="text-sm text-gray-600">{rest.address}, {rest.city}</p>
                <div className="mt-2 flex gap-4">
                  <Link to={`/manager/restaurant/edit/${rest.restaurantId}`} className="text-blue-600 hover:underline">
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

      {pendingRestaurants.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4 text-yellow-700">Pending Approval</h2>
          <ul className="space-y-4">
            {pendingRestaurants.map((rest) => (
              <li key={rest.restaurantId} className="border p-4 rounded-md shadow-sm border-yellow-300 bg-yellow-50">
                <h3 className="text-lg font-bold">{rest.name}</h3>
                <p className="text-sm text-gray-600">{rest.address}, {rest.city}</p>
                <div className="mt-2 text-sm text-yellow-700">Waiting for admin approval</div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white w-full max-w-2xl p-6 rounded shadow-xl">
            <h2 className="text-xl font-bold mb-4">Add New Restaurant</h2>
            <form onSubmit={handleAddRestaurant} className="space-y-4 max-h-[70vh] overflow-y-auto pr-2">
              <div className="grid grid-cols-2 gap-4">
                <div><Label htmlFor="name">Name</Label><Input id="name" name="name" value={form.name} onChange={handleChange} /></div>
                <div><Label htmlFor="phone">Phone</Label><Input id="phone" name="phone" value={form.phone} onChange={handleChange} /></div>
                <div><Label htmlFor="address">Address</Label><Input id="address" name="address" value={form.address} onChange={handleChange} /></div>
                <div><Label htmlFor="city">City</Label><Input id="city" name="city" value={form.city} onChange={handleChange} /></div>
                <div><Label htmlFor="state">State</Label><Input id="state" name="state" value={form.state} onChange={handleChange} /></div>
                <div><Label htmlFor="zipCode">Zip Code</Label><Input id="zipCode" name="zipCode" value={form.zipCode} onChange={handleChange} /></div>
                <div><Label htmlFor="cuisine">Cuisine</Label><Input id="cuisine" name="cuisine" value={form.cuisine} onChange={handleChange} /></div>
                <div><Label htmlFor="costRating">Cost</Label><Input id="costRating" name="costRating" value={form.costRating} onChange={handleChange} /></div>
                <div className="col-span-2"><Label htmlFor="photoUrl">Photo URL</Label><Input id="photoUrl" name="photoUrl" value={form.photoUrl} onChange={handleChange} /></div>
                <div className="col-span-2"><Label htmlFor="description">Description</Label><Textarea id="description" name="description" value={form.description} onChange={handleChange} /></div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.entries(form.hours).map(([day, val]) => (
                  <div key={day}><Label>{day}</Label><Input name={`hours.${day}`} value={val} onChange={handleChange} /></div>
                ))}
              </div>

              <div className="grid grid-cols-3 gap-4 mt-4">
                {Object.entries(form.tables).map(([size, qty]) => (
                  <div key={size}>
                    <Label htmlFor={`tables.${size}`}>Tables of {size}</Label>
                    <Input
                      id={`tables.${size}`}
                      name={`tables.${size}`}
                      type="number"
                      value={qty}
                      onChange={handleChange}
                    />
                  </div>
                ))}
              </div>

              <div className="flex justify-end gap-4 mt-4">
                <Button type="button" variant="outline" onClick={() => setShowModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-green-600 hover:bg-green-700">Add Restaurant</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
