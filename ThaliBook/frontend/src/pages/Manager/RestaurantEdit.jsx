import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

export default function RestaurantEdit() {
  const { token } = useSelector(state => state.auth);
  const { id: restaurantId } = useParams();
  const [restaurant, setRestaurant] = useState(null);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [updated, setUpdated] = useState(false);

  useEffect(() => {
    async function fetchRestaurant() {
      try {
        const res = await axios.get(`http://localhost:8080/api/restaurants/details/${restaurantId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = res.data;
        // Ensure 'tables' and 'hours' exist and are structured properly
        setRestaurant(data);
        setForm({
          ...data,
          tables: data.tables || { 2: '', 4: '', 6: '' },
          hours: data.hours || { Mon: '', Tue: '', Wed: '', Thu: '', Fri: '', Sat: '', Sun: '' },
        });
      } catch (err) {
        console.error('Failed to load restaurant:', err);
        toast.error('Failed to load restaurant details');
      } finally {
        setLoading(false);
      }
    }

    if (restaurantId) {
      fetchRestaurant();
    }
  }, [restaurantId, token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('hours.')) {
      const day = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        hours: {
          ...prev.hours,
          [day]: value,
        },
      }));
    } else if (name.startsWith('tables.')) {
      const size = name.split('.')[1];
      setForm(prev => ({
        ...prev,
        tables: {
          ...prev.tables,
          [size]: parseInt(value) || '',
        },
      }));
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`http://localhost:8080/api/restaurants/${restaurantId}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUpdated(true);
      toast.success('Restaurant updated successfully!');
    } catch (err) {
      console.error('Failed to update restaurant:', err);
      toast.error('Update failed');
    }
  };

  if (loading) return <div className="text-center py-10">Loading restaurant data...</div>;
  if (!restaurant) return <div className="text-center py-10">Restaurant not found</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Edit Restaurant: {restaurant.name}</h1>

      {updated && (
        <div className="mb-4 px-4 py-2 bg-green-50 border border-green-200 text-green-800 rounded-md shadow-sm">
          ✅ Restaurant details updated successfully!
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded shadow space-y-4">
        <div>
          <Label htmlFor="name">Name</Label>
          <Input id="name" name="name" value={form.name || ''} onChange={handleChange} />
        </div>

        <div>
          <Label htmlFor="address">Address</Label>
          <Input id="address" name="address" value={form.address || ''} onChange={handleChange} />
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="city">City</Label>
            <Input id="city" name="city" value={form.city || ''} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="state">State</Label>
            <Input id="state" name="state" value={form.state || ''} onChange={handleChange} />
          </div>
          <div>
            <Label htmlFor="zipCode">Zip Code</Label>
            <Input id="zipCode" name="zipCode" value={form.zipCode || ''} onChange={handleChange} />
          </div>
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" value={form.phone || ''} onChange={handleChange} />
        </div>

        <div>
          <Label htmlFor="cuisine">Cuisine</Label>
          <Input id="cuisine" name="cuisine" value={form.cuisine || ''} onChange={handleChange} />
        </div>

        <div>
          <Label htmlFor="costRating">Cost Rating</Label>
          <Input id="costRating" name="costRating" value={form.costRating || ''} onChange={handleChange} />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea id="description" name="description" value={form.description || ''} onChange={handleChange} />
        </div>

        <div>
          <Label htmlFor="photoUrl">Photo URL</Label>
          <Input id="photoUrl" name="photoUrl" value={form.photoUrl || ''} onChange={handleChange} />
        </div>

        <div className="grid grid-cols-2 gap-4">
          {Object.entries(form.hours || {}).map(([day, value]) => (
            <div key={day}>
              <Label htmlFor={`hours.${day}`}>{day}</Label>
              <Input
                id={`hours.${day}`}
                name={`hours.${day}`}
                value={value}
                onChange={handleChange}
              />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4">
          {Object.entries(form.tables || {}).map(([size, value]) => (
            <div key={size}>
              <Label htmlFor={`tables.${size}`}>Tables of {size}</Label>
              <Input
                id={`tables.${size}`}
                name={`tables.${size}`}
                type="number"
                value={value}
                onChange={handleChange}
              />
            </div>
          ))}
        </div>

        <Button type="submit" className="bg-orange-600 hover:bg-orange-700">
          Update Restaurant
        </Button>
      </form>
    </div>
  );
}
