// src/components/search/SearchForm.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Clock, Users, MapPin } from 'lucide-react';
import { format } from 'date-fns';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';

export default function SearchForm() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    time: '19:00',
    partySize: '2',
    location: ''
  });
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [locationError, setLocationError] = useState('');
  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const handleChange = (field, value) => {
    setSearchParams(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Update searchParams.date when selectedDate changes
  useEffect(() => {
    if (selectedDate) {
      handleChange('date', format(selectedDate, 'yyyy-MM-dd'));
    }
  }, [selectedDate]);

  const times = Array.from({length: 28}, (_, i) => {
    const hour = Math.floor((20 + i) / 2);
    const minute = i % 2 === 0 ? '00' : '30';
    return `${hour.toString().padStart(2, '0')}:${minute}`;
  });  
  // Function to get user's location using Mapbox
  const getUserLocation = () => {
    setIsGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            
            // Get Mapbox token from environment variables
            // In a real app, you would store this in .env file
            const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN || 'pk.your_mapbox_token_here';
            
            if (MAPBOX_ACCESS_TOKEN === 'pk.your_mapbox_token_here') {
              console.warn('Please set your Mapbox access token in environment variables (VITE_MAPBOX_TOKEN)');
            }
            
            try {
              // Using Mapbox Geocoding API to get the zip code
              const response = await fetch(
                `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_ACCESS_TOKEN}&types=postcode`
              );
              
              if (!response.ok) {
                throw new Error(`Mapbox API error: ${response.status}`);
              }
              
              const data = await response.json();
              
              if (data.features && data.features.length > 0) {
                // Extract the postal code from the response
                const postalCode = data.features[0].text;
                setSearchParams(prev => ({
                  ...prev,
                  location: postalCode
                }));
              } else {
                // If no postal code found, try a more general search
                const generalResponse = await fetch(
                  `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?access_token=${MAPBOX_ACCESS_TOKEN}`
                );
                
                if (!generalResponse.ok) {
                  throw new Error(`Mapbox API error: ${generalResponse.status}`);
                }
                
                const generalData = await generalResponse.json();
                
                if (generalData.features && generalData.features.length > 0) {
                  // Try to find postal code in context
                  const postalContext = generalData.features[0].context?.find(
                    item => item.id.startsWith('postcode')
                  );
                  
                  if (postalContext) {
                    setSearchParams(prev => ({
                      ...prev,
                      location: postalContext.text
                    }));
                  } else {
                    // Use place name as fallback
                    const placeName = generalData.features[0].place_name.split(',')[0];
                    setSearchParams(prev => ({
                      ...prev,
                      location: placeName
                    }));
                  }
                }
              }
            } catch (apiError) {
              console.error("Mapbox API error:", apiError);
              // Fallback to a simple zip code estimation based on coordinates
              // This is not accurate but provides something rather than nothing
              // In a real app, you would use a proper geocoding service
              const zipEstimate = `${Math.abs(Math.round(latitude * 100) % 100000)}`;
              setSearchParams(prev => ({
                ...prev,
                location: zipEstimate
              }));
            }
          } catch (error) {
            console.error("Error getting location:", error);
          } finally {
            setIsGettingLocation(false);
          }
        },
        (error) => {
          console.error("Error getting geolocation:", error);
          setIsGettingLocation(false);
        }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
      setIsGettingLocation(false);
    }
  };

  // Get user location when component mounts
  useEffect(() => {
    getUserLocation();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate location field
    if (!searchParams.location.trim()) {
      setLocationError('Location is required');
      return;
    }
    
    const params = new URLSearchParams();
    Object.entries(searchParams).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    navigate(`/search?${params.toString()}`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-5">
          {/* Date Field */}
          <div>
            <p className="mb-2 text-gray-700 font-medium">Date</p>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                <Calendar className="h-5 w-5 text-gray-400" />
              </div>
              <DatePicker
                selected={selectedDate}
                onChange={date => setSelectedDate(date)}
                dateFormat="MMMM d, yyyy"
                className="pl-10 w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                wrapperClassName="w-full"
                popperClassName="z-50"
                minDate={new Date()}
              />
            </div>
          </div>
          
          {/* Time Field */}
          <div>
            <p className="mb-2 text-gray-700 font-medium">Time</p>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                <Clock className="h-5 w-5 text-gray-400" />
              </div>
              <Select 
                value={searchParams.time}
                onValueChange={(value) => handleChange('time', value)}
              >
                <SelectTrigger className="pl-10 w-full">
                  <SelectValue>{searchParams.time}</SelectValue>
                </SelectTrigger>
                <SelectContent className={"bg-white"}>
                  {times.map(time => (
                    <SelectItem key={time} value={time}>
                      {time}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Party Size Field */}
          <div>
            <p className="mb-2 text-gray-700 font-medium">Party Size</p>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                <Users className="h-5 w-5 text-gray-400" />
              </div>
              <Select 
                value={searchParams.partySize}
                onValueChange={(value) => handleChange('partySize', value)}
              >
                <SelectTrigger className="pl-10 w-full">
                  <SelectValue>{searchParams.partySize}</SelectValue>
                </SelectTrigger>
                <SelectContent className={"bg-white"}>
                  {[1, 2, 3, 4, 5, 6].map(size => (
                    <SelectItem key={size} value={size.toString()}>
                      {size} {size === 1 ? 'person' : 'people'}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {/* Location Field */}
          <div>
            <p className="mb-2 text-gray-700 font-medium">Location</p>
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 z-10 pointer-events-none">
                <MapPin className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                type="text"
                placeholder="City or Zip"
                className={`pl-10 w-full ${locationError ? 'border-red-500' : ''}`}
                value={searchParams.location}
                onChange={(e) => {
                  handleChange('location', e.target.value);
                  if (locationError) setLocationError('');
                }}
                required
              />
              {locationError && (
                <p className="text-red-500 text-sm mt-1">{locationError}</p>
              )}
              {isGettingLocation && (
                <p className="text-gray-500 text-sm mt-1">Getting your location...</p>
              )}
            </div>
          </div>
        </div>
        
        <Button 
          type="submit" 
          className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium h-12 text-base"
        >
          Find a Table
        </Button>
      </form>
    </div>
  );
}