import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '@/services/api';
import { toast } from 'sonner';
import { Save, Trash2 } from 'lucide-react';
import ManagerSidebar from '@/components/layout/ManagerSidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function RestaurantEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const MAPBOX_ACCESS_TOKEN = 'pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4M29iazA2Z2gycXA4N2pmbDZmangifQ.-g_vE53SD2WrJ6tFX7QHmA'; // Replace with your actual Mapbox token
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    description: '',
    cuisine: '',
    costRating: '$',
    photoUrl: '',
    latitude: null,
    longitude: null,
    hours: {
      Mon: '09:00-22:00',
      Tue: '09:00-22:00',
      Wed: '09:00-22:00',
      Thu: '09:00-22:00',
      Fri: '09:00-23:00',
      Sat: '09:00-23:00',
      Sun: '09:00-22:00'
    },
    tables: {
      2: 10,
      4: 8,
      6: 5
    }
  });

  useEffect(() => {
    fetchRestaurant();
  }, [id]);

  const fetchRestaurant = async () => {
    setLoading(true);
    try {
      const response = await api.get(`/restaurants/details/${id}`);
      
      // Initialize hours if not present
      if (!response.data.hours) {
        response.data.hours = {
          Mon: '09:00-22:00',
          Tue: '09:00-22:00',
          Wed: '09:00-22:00',
          Thu: '09:00-22:00',
          Fri: '09:00-23:00',
          Sat: '09:00-23:00',
          Sun: '09:00-22:00'
        };
      } else {
        // Convert hours to the correct format if they're in the old format
        const formattedHours = {};
        const dayMap = {
          'Monday': 'Mon',
          'Tuesday': 'Tue',
          'Wednesday': 'Wed',
          'Thursday': 'Thu',
          'Friday': 'Fri',
          'Saturday': 'Sat',
          'Sunday': 'Sun'
        };
        
        Object.entries(response.data.hours).forEach(([day, hours]) => {
          // If the day is in the old format, convert it
          const newDay = dayMap[day] || day;
          // Format the hours
          formattedHours[newDay] = validateAndFormatHours(hours);
        });
        
        response.data.hours = formattedHours;
      }
      
      // Initialize tables if not present
      if (!response.data.tables) {
        response.data.tables = {
          2: 10,
          4: 8,
          6: 5
        };
      }
      
      setFormData(response.data);
    } catch (err) {
      console.error('Failed to fetch restaurant:', err);
      toast.error('Failed to load restaurant details');
      navigate('/manager/restaurants');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Helper function to validate and format hours in 24-hour format (HH:MM-HH:MM)
  const validateAndFormatHours = (value) => {
    // Check if the input already matches the required format
    if (/^\d{2}:\d{2}-\d{2}:\d{2}$/.test(value)) {
      return value;
    }
    
    // Try to parse and convert the input
    try {
      // Split by hyphen or dash
      const parts = value.split(/[-–—]/);
      if (parts.length !== 2) {
        return value; // Return as is if we can't parse
      }
      
      const openTime = parts[0].trim();
      const closeTime = parts[1].trim();
      
      // Function to convert time to 24-hour format
      const convertTo24Hour = (timeStr) => {
        // If already in 24-hour format
        if (/^\d{1,2}:\d{2}$/.test(timeStr)) {
          // Ensure 2 digits for hours
          const [hours, minutes] = timeStr.split(':');
          return `${hours.padStart(2, '0')}:${minutes}`;
        }
        
        // Try to parse 12-hour format
        const match = timeStr.match(/(\d{1,2}):?(\d{2})?\s*(am|pm|AM|PM)/);
        if (!match) return timeStr;
        
        let hours = parseInt(match[1], 10);
        const minutes = match[2] ? match[2] : '00';
        const period = match[3].toLowerCase();
        
        if (period === 'pm' && hours < 12) hours += 12;
        if (period === 'am' && hours === 12) hours = 0;
        
        return `${hours.toString().padStart(2, '0')}:${minutes}`;
      };
      
      const formattedOpen = convertTo24Hour(openTime);
      const formattedClose = convertTo24Hour(closeTime);
      
      return `${formattedOpen}-${formattedClose}`;
    } catch (error) {
      console.error('Error formatting hours:', error);
      return value; // Return as is if there's an error
    }
  };

  const handleHoursChange = (day, value) => {
    setFormData(prev => ({
      ...prev,
      hours: {
        ...prev.hours,
        [day]: value
      }
    }));
  };

  const handleTablesChange = (size, value) => {
    const numValue = parseInt(value, 10) || 0;
    setFormData(prev => ({
      ...prev,
      tables: {
        ...prev.tables,
        [size]: numValue
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Create a copy of the form data for submission
      const updatedData = {
        ...formData,
        // Format hours to ensure they're in the correct format
        hours: Object.entries(formData.hours).reduce((acc, [day, hours]) => {
          acc[day] = validateAndFormatHours(hours);
          return acc;
        }, {})
      };
      
      // Geocode the address to get latitude and longitude
      try {
        const fullAddress = `${updatedData.address}, ${updatedData.city}, ${updatedData.state} ${updatedData.zipCode}`;
        const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(fullAddress)}.json?access_token=${MAPBOX_ACCESS_TOKEN}`;
        
        const geocodeResponse = await axios.get(geocodeUrl);
        
        if (geocodeResponse.data.features && geocodeResponse.data.features.length > 0) {
          const [longitude, latitude] = geocodeResponse.data.features[0].center;
          updatedData.latitude = latitude;
          updatedData.longitude = longitude;
          console.log('Geocoded coordinates:', { latitude, longitude });
        } else {
          console.warn('No geocoding results found for address:', fullAddress);
        }
      } catch (geocodeError) {
        console.error('Error geocoding address:', geocodeError);
        // Continue with submission even if geocoding fails
      }
      
      await api.patch(`/restaurants/${id}`, updatedData);
      toast.success('Restaurant updated successfully!');
      navigate('/manager/restaurants');
    } catch (err) {
      console.error('Failed to update restaurant:', err);
      toast.error('Failed to update restaurant. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/restaurants/${id}`);
      toast.success('Restaurant deleted successfully!');
      navigate('/manager/restaurants');
    } catch (err) {
      console.error('Failed to delete restaurant:', err);
      toast.error('Failed to delete restaurant. Please try again.');
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <ManagerSidebar />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ManagerSidebar />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Restaurant Profile Management</h1>
          <div className="flex space-x-2">
            <Link to={`/manager/reservations/${id}`}>
              <Button variant="outline">
                Manage Reservations
              </Button>
            </Link>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete the restaurant
                    and all associated data including reservations.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-red-600 hover:bg-red-700"
                    disabled={deleting}
                  >
                    {deleting ? 'Deleting...' : 'Delete'}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Restaurant Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="cuisine">Cuisine Type</Label>
                  <Select
                    value={formData.cuisine}
                    onValueChange={(value) => handleSelectChange('cuisine', value)}
                    required
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select cuisine" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Indian">Indian</SelectItem>
                      <SelectItem value="Italian">Italian</SelectItem>
                      <SelectItem value="Chinese">Chinese</SelectItem>
                      <SelectItem value="Japanese">Japanese</SelectItem>
                      <SelectItem value="Mexican">Mexican</SelectItem>
                      <SelectItem value="Thai">Thai</SelectItem>
                      <SelectItem value="American">American</SelectItem>
                      <SelectItem value="Mediterranean">Mediterranean</SelectItem>
                      <SelectItem value="French">French</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="costRating">Price Range</Label>
                  <Select
                    value={formData.costRating}
                    onValueChange={(value) => handleSelectChange('costRating', value)}
                    required
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select price range" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="$">$ (Inexpensive)</SelectItem>
                      <SelectItem value="$$">$$ (Moderate)</SelectItem>
                      <SelectItem value="$$$">$$$ (Expensive)</SelectItem>
                      <SelectItem value="$$$$">$$$$ (Very Expensive)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  name="description"
                  value={formData.description || ''}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Describe your restaurant..."
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="photoUrl">Photo URL</Label>
                <Input
                  id="photoUrl"
                  name="photoUrl"
                  value={formData.photoUrl || ''}
                  onChange={handleChange}
                  placeholder="https://example.com/photo.jpg"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Location & Contact */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Location & Contact</h2>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="address">Street Address</Label>
                <Input
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    required
                    maxLength={2}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  value={formData.zipCode}
                  onChange={handleChange}
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  placeholder="123-456-7890"
                  className="mt-1"
                />
              </div>
            </div>
          </div>

          {/* Hours & Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hours of Operation */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Hours of Operation</h2>
              <p className="text-sm text-gray-500 mb-4">Enter hours in 24-hour format (e.g., 09:00-22:00)</p>
              <div className="space-y-3">
                {Object.keys(formData.hours).map((day) => (
                  <div key={day}>
                    <Label htmlFor={`hours-${day}`}>{day}</Label>
                    <Input
                      id={`hours-${day}`}
                      value={formData.hours[day]}
                      onChange={(e) => handleHoursChange(day, e.target.value)}
                      placeholder="09:00-22:00"
                      className="mt-1"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Table Configuration */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Table Configuration</h2>
              <div className="space-y-3">
                {Object.keys(formData.tables).map((size) => (
                  <div key={size} className="flex items-center">
                    <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                      <span className="text-sm font-medium">{size}</span>
                    </div>
                    <div className="flex-grow">
                      <Label htmlFor={`tables-${size}`}>{size} Seater Tables</Label>
                      <Input
                        id={`tables-${size}`}
                        type="number"
                        min="0"
                        value={formData.tables[size]}
                        onChange={(e) => handleTablesChange(size, e.target.value)}
                        className="mt-1"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate('/manager/restaurants')}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="bg-orange-600 hover:bg-orange-700"
              disabled={saving}
            >
              {saving ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center">
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
