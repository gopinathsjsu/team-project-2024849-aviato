import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import api from '@/services/api';
import { toast } from 'sonner';
import { Save } from 'lucide-react';
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
import ManagerSidebar from '@/components/layout/ManagerSidebar';

export default function RestaurantAdd() {
  const navigate = useNavigate();
  const { token } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [existingRestaurants, setExistingRestaurants] = useState([]);
  const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
  // Fetch existing restaurants to check for name uniqueness
  useEffect(() => {
    const fetchExistingRestaurants = async () => {
      try {
        const response = await api.get('/restaurants/manager', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setExistingRestaurants(response.data);
      } catch (err) {
        console.error('Failed to fetch existing restaurants:', err);
      }
    };

    if (token) {
      fetchExistingRestaurants();
    }
  }, [token]);

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
    latitude: '',
    longitude: '',
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
      2: 10, // 10 tables for 2 people
      4: 8,  // 8 tables for 4 people
      6: 5   // 5 tables for 6 people
    }
  });

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
    setLoading(true);

    try {
      // Validate phone number format
      const phoneDigits = formData.phone.replace(/[^\d]/g, '');
      if (phoneDigits.length < 7) {
        toast.error('Phone number must be at least 7 digits (format: 123-4567)');
        setLoading(false);
        return;
      }

      // Check if a restaurant with this name already exists
      const nameExists = existingRestaurants.some(
        restaurant => restaurant.name.toLowerCase() === formData.name.toLowerCase()
      );
      
      if (nameExists) {
        toast.error('A restaurant with this name already exists. Please choose a different name.');
        setLoading(false);
        return;
      }

      // Format the data according to backend requirements
      const formattedData = {
        ...formData,
        // Ensure phone is in the format "123-4567" as required by backend
        // The backend expects EXACTLY 3 digits, hyphen, 4 digits
        phone: formData.phone.replace(/[^\d]/g, '').substring(0, 7).replace(/(\d{3})(\d{4})/, '$1-$2'),
        // Ensure state is exactly 2 characters
        state: formData.state.substring(0, 2).toUpperCase(),
        // Ensure zipCode is 5 digits
        zipCode: formData.zipCode.replace(/[^\d]/g, '').substring(0, 5),
        // Ensure costRating is one of "$", "$$", or "$$$"
        costRating: formData.costRating.length > 3 ? formData.costRating.substring(0, 3) : formData.costRating,
        // Format hours to ensure they're in the correct format
        hours: Object.entries(formData.hours).reduce((acc, [day, hours]) => {
          acc[day] = validateAndFormatHours(hours);
          return acc;
        }, {})
      };

      // Geocode the address to get latitude and longitude
      try {
        const fullAddress = `${formattedData.address}, ${formattedData.city}, ${formattedData.state} ${formattedData.zipCode}`;
        const geocodeUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(fullAddress)}.json?access_token=${MAPBOX_ACCESS_TOKEN}`;
        
        const geocodeResponse = await axios.get(geocodeUrl);
        
        if (geocodeResponse.data.features && geocodeResponse.data.features.length > 0) {
          const [longitude, latitude] = geocodeResponse.data.features[0].center;
          formattedData.latitude = latitude;
          formattedData.longitude = longitude;
          console.log('Geocoded coordinates:', { latitude, longitude });
        } else {
          console.warn('No geocoding results found for address:', fullAddress);
        }
      } catch (geocodeError) {
        console.error('Error geocoding address:', geocodeError);
        // Continue with submission even if geocoding fails
      }

      console.log('Submitting restaurant data:', formattedData);

      await api.post('/restaurants', formattedData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      toast.success('Restaurant added successfully! Waiting for admin approval.');
      navigate('/manager/restaurants');
    } catch (err) {
      console.error('Failed to add restaurant:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      console.error('Error headers:', err.response?.headers);
      toast.error(`Failed to add restaurant: ${err.response?.data?.error || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ManagerSidebar />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <h1 className="text-2xl font-bold mb-6">Add New Restaurant</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Basic Information */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Basic Information</h2>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Restaurant Name*</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="cuisine">Cuisine Type*</Label>
                  <Select
                    value={formData.cuisine}
                    onValueChange={(value) => handleSelectChange('cuisine', value)}
                    required
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select cuisine" />
                    </SelectTrigger>
                    <SelectContent className={"bg-white"}>
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
                  <Label htmlFor="costRating">Price Range*</Label>
                  <Select
                    value={formData.costRating}
                    onValueChange={(value) => handleSelectChange('costRating', value)}
                    required
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select price range" />
                    </SelectTrigger>
                    <SelectContent className={"bg-white"}>
                      <SelectItem value="$">$ (Inexpensive)</SelectItem>
                      <SelectItem value="$$">$$ (Moderate)</SelectItem>
                      <SelectItem value="$$$">$$$ (Expensive)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
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
                    value={formData.photoUrl}
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
                  <Label htmlFor="address">Street Address*</Label>
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
                    <Label htmlFor="city">City*</Label>
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
                    <Label htmlFor="state">State*</Label>
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
                  <Label htmlFor="zipCode">ZIP Code*</Label>
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
                  <Label htmlFor="phone">Phone Number* (format: 123-4567)</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={(e) => {
                      // Format phone number as user types
                      const value = e.target.value.replace(/[^\d]/g, '');
                      const formattedValue = value.substring(0, 7).replace(/(\d{3})(\d{1,4})/, '$1-$2');
                      setFormData(prev => ({
                        ...prev,
                        phone: formattedValue
                      }));
                    }}
                    required
                    placeholder="123-4567"
                    className="mt-1"
                  />
                </div>

                {/* Latitude and longitude fields removed - will be automatically geocoded */}
              </div>
            </div>
          </div>

          {/* Hours of Operation */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4">Hours of Operation</h2>
            <p className="text-sm text-gray-500 mb-4">Enter hours in 24-hour format (e.g., 09:00-22:00)</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.keys(formData.tables).map((size) => (
                <div key={size}>
                  <Label htmlFor={`tables-${size}`}>Tables for {size} people</Label>
                  <Input
                    id={`tables-${size}`}
                    type="number"
                    min="0"
                    value={formData.tables[size]}
                    onChange={(e) => handleTablesChange(size, e.target.value)}
                    className="mt-1"
                  />
                </div>
              ))}
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
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center">
                  <Save className="h-4 w-4 mr-2" />
                  Save Restaurant
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}