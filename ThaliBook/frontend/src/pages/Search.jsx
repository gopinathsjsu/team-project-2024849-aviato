// src/pages/Search.jsx
import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { searchRestaurants } from '@/store/thunks/restaurantThunks';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, Users, Star, Plus, Minus, Maximize } from 'lucide-react';
import { format } from 'date-fns';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function Search() {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { restaurants, loading, error } = useSelector(state => state.restaurant);
  
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [visibleRestaurants, setVisibleRestaurants] = useState([]);
  
  const date = searchParams.get('date') || format(new Date(), 'yyyy-MM-dd');
  const time = searchParams.get('time') || '19:00';
  const partySize = searchParams.get('partySize') || '2';
  const location = searchParams.get('location') || '';
  
  // Fetch restaurants on initial load
  useEffect(() => {
    dispatch(searchRestaurants({
      date,
      time,
      partySize,
      ...(location && { location })
    }));
  }, [dispatch, date, time, partySize, location]);
  
  // Initialize map when restaurants are loaded
  useEffect(() => {
    if (loading || !restaurants.length || !mapContainer.current || mapLoaded) return;
    
    const initializeMap = async () => {
      try {
        const mapboxgl = await import('mapbox-gl');
        mapboxgl.default.accessToken = 'pk.eyJ1IjoicHJ1dGh2aWswOSIsImEiOiJjbTl5bTQ1NzQwM3YyMndvZzF4OXc1a3RxIn0.F9sTscmR-4pV3g-AnFv5Yg';
        
        // Create geocoded restaurant data with coordinates
        const restaurantsWithCoordinates = [];
        const bounds = new mapboxgl.default.LngLatBounds();
        
        // In a real application, coordinates would come from your backend
        // For demo purposes, we'll add mock coordinates for West Coast cities
        const mockCoordinates = {
          'Portland, OR': [-122.6784, 45.5152],
          'Seattle, WA': [-122.3321, 47.6062],
          'San Francisco, CA': [-122.4194, 37.7749],
          'Los Angeles, CA': [-118.2437, 34.0522],
          'San Diego, CA': [-117.1611, 32.7157],
        };
        
        restaurants.forEach(restaurant => {
          const cityState = `${restaurant.city}, ${restaurant.state}`;
          const coords = mockCoordinates[cityState] || [-122.4194, 37.7749]; // Default to SF
          
          bounds.extend(coords);
          restaurantsWithCoordinates.push({
            ...restaurant,
            coordinates: coords
          });
        });
        
        // Create the map
        const newMap = new mapboxgl.default.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v11',
          bounds: bounds,
          fitBoundsOptions: { padding: 50 }
        });
        
        // Add navigation controls
        newMap.addControl(new mapboxgl.default.NavigationControl(), 'top-right');
        
        // Add markers for each restaurant
        restaurantsWithCoordinates.forEach(restaurant => {
          // Create custom marker element
          const el = document.createElement('div');
          el.className = 'restaurant-marker';
          el.style.backgroundColor = '#ff5a1f';
          el.style.width = '24px';
          el.style.height = '24px';
          el.style.borderRadius = '50%';
          el.style.border = '3px solid white';
          el.style.boxShadow = '0 0 3px rgba(0,0,0,0.4)';
          el.style.cursor = 'pointer';
          
          // Create popup
          const popup = new mapboxgl.default.Popup({ offset: 25 }).setHTML(
            `<div style="padding: 8px;">
              <h3 style="font-weight: bold; margin-bottom: 4px; font-size: 14px;">${restaurant.name}</h3>
              <p style="margin: 0; font-size: 12px;">${restaurant.cuisine}</p>
            </div>`
          );
          
          // Add marker to map
          const marker = new mapboxgl.default.Marker(el)
            .setLngLat(restaurant.coordinates)
            .setPopup(popup)
            .addTo(newMap);
          
          markers.current.push(marker);
        });
        
        // Store restaurants with coordinates
        setVisibleRestaurants(restaurantsWithCoordinates);
        
        // Update visible restaurants when map moves
        newMap.on('moveend', () => {
          const newBounds = newMap.getBounds();
          
          const newVisibleRestaurants = restaurantsWithCoordinates.filter(restaurant => {
            return newBounds.contains(restaurant.coordinates);
          });
          
          setVisibleRestaurants(newVisibleRestaurants);
        });
        
        // Set map as loaded
        newMap.on('load', () => {
          setMapLoaded(true);
          map.current = newMap;
        });
        
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };
    
    initializeMap();
    
    // Cleanup function
    return () => {
      if (map.current) {
        map.current.remove();
        markers.current = [];
      }
    };
  }, [restaurants, loading, mapLoaded]);
  
  // Function to render star rating
  const renderStars = (rating = 4) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <span 
            key={star} 
            className={star <= rating ? "text-orange-500" : "text-gray-300"}
          >
            ★
          </span>
        ))}
      </div>
    );
  };
  
  return (
    <div className="flex flex-col h-screen">
      {/* Search bar */}
      <div className="bg-gray-800 text-white py-3 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="hidden md:flex items-center space-x-4">
            <div className="bg-white text-gray-800 py-2 px-3 rounded-md flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-gray-500" />
              <span>{format(new Date(date), 'MMMM d, yyyy')}</span>
            </div>
            
            <div className="bg-white text-gray-800 py-2 px-3 rounded-md flex items-center">
              <Clock className="h-5 w-5 mr-2 text-gray-500" />
              <span>{time}</span>
            </div>
            
            <div className="bg-white text-gray-800 py-2 px-3 rounded-md flex items-center">
              <Users className="h-5 w-5 mr-2 text-gray-500" />
              <span>{partySize} {parseInt(partySize) === 1 ? 'person' : 'people'}</span>
            </div>
          </div>
          
          <Link to="/" className="text-white hover:underline">
            Modify search
          </Link>
        </div>
      </div>
      
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Restaurant list */}
        <div className="w-full md:w-2/5 flex flex-col overflow-hidden border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h2 className="text-lg font-bold">
              {visibleRestaurants.length} restaurant{visibleRestaurants.length !== 1 ? 's' : ''} available
            </h2>
          </div>
          
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="flex justify-center items-center h-full">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
              </div>
            ) : visibleRestaurants.length === 0 ? (
              <div className="flex justify-center items-center h-full">
                <div className="text-center p-4">
                  <p className="text-gray-500 mb-2">No restaurants found in this area.</p>
                  <p className="text-gray-500">Try zooming out or adjusting your search.</p>
                </div>
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {visibleRestaurants.map(restaurant => (
                  <div key={restaurant.restaurantId} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start">
                      <div className="w-1/4 mr-4">
                        <img
                          src={restaurant.photoUrl || 'https://images.pexels.com/photos/958545/pexels-photo-958545.jpeg'}
                          alt={restaurant.name}
                          className="w-full h-24 object-cover rounded-md"
                        />
                      </div>
                      
                      <div className="flex-1">
                        <Link to={`/restaurant/${restaurant.restaurantId}?date=${date}&time=${time}&partySize=${partySize}`}>
                          <h3 className="text-lg font-bold mb-1 hover:text-orange-600">{restaurant.name}</h3>
                        </Link>
                        
                        <div className="flex items-center mb-1">
                          {renderStars(4)}
                          <span className="ml-2 text-sm text-gray-600">(120 reviews)</span>
                        </div>
                        
                        <div className="flex items-center text-sm text-gray-600 mb-3">
                          <span>{restaurant.cuisine || 'American'}</span>
                          <span className="mx-2">•</span>
                          <span>{restaurant.costRating || '$$$'}</span>
                          <span className="mx-2">•</span>
                          <span>{restaurant.city}, {restaurant.state}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2">
                          {['18:00', '18:30', '19:00', '19:30', '20:00'].map(timeSlot => (
                            <Link 
                              key={timeSlot} 
                              to={`/booking/${restaurant.restaurantId}?date=${date}&time=${timeSlot}&partySize=${partySize}`}
                            >
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className={`min-w-16 ${timeSlot === time ? 'bg-orange-600 text-white border-orange-600' : 'border-orange-400 text-orange-600 hover:bg-orange-50'}`}
                              >
                                {timeSlot}
                              </Button>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        {/* Map */}
        <div className="hidden md:block md:w-3/5 relative">
          <div ref={mapContainer} className="absolute inset-0" />
          
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          )}
          
          {/* Map controls */}
          <div className="absolute top-3 right-3 z-10 flex flex-col space-y-2">
            <button className="bg-white p-2 rounded-md shadow-md hover:bg-gray-100 focus:outline-none" title="Zoom in">
              <Plus className="h-5 w-5 text-gray-700" />
            </button>
            <button className="bg-white p-2 rounded-md shadow-md hover:bg-gray-100 focus:outline-none" title="Zoom out">
              <Minus className="h-5 w-5 text-gray-700" />
            </button>
            <button className="bg-white p-2 rounded-md shadow-md hover:bg-gray-100 focus:outline-none" title="Full screen">
              <Maximize className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}