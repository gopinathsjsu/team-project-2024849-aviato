// src/pages/Search.jsx
import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { searchRestaurants } from '@/store/thunks/restaurantThunks';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  Clock,
  Users,
  Star,
  Plus,
  Minus,
  Maximize,
  Flame,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function Search() {
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();
  const { restaurants, loading } = useSelector((state) => state.restaurant);

  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [visibleRestaurants, setVisibleRestaurants] = useState([]);

  const date = searchParams.get('date') || format(new Date(), 'yyyy-MM-dd');
  const time = searchParams.get('time') || '19:00';
  const partySize = searchParams.get('partySize') || '2';
  const location = searchParams.get('location') || '';

  const getSurroundingSlots = (time) => {
    const times = Array.from({ length: 28 }, (_, i) => `${String(10 + Math.floor(i / 2)).padStart(2, '0')}:${i % 2 === 0 ? '00' : '30'}`);
    const idx = times.indexOf(time);
    return times.slice(Math.max(0, idx - 2), idx + 3);
  };

  useEffect(() => {
    dispatch(
      searchRestaurants({
        date,
        time,
        partySize,
        ...(location && !isNaN(location) ? { zip: location } : { city: location }),
      })
    );
  }, [dispatch, date, time, partySize, location]);

  useEffect(() => {
    if (loading || !restaurants.length || !mapContainer.current || mapLoaded) return;

    const initializeMap = async () => {
      try {
        const mapboxgl = await import('mapbox-gl');
        mapboxgl.default.accessToken =
          'pk.eyJ1IjoicHJ1dGh2aWswOSIsImEiOiJjbTl5bTQ1NzQwM3YyMndvZzF4OXc1a3RxIn0.F9sTscmR-4pV3g-AnFv5Yg';

        const restaurantsWithCoordinates = [];
        const bounds = new mapboxgl.default.LngLatBounds();

        for (let i = 0; i < restaurants.length; i++) {
          const restaurant = restaurants[i];
          if (restaurant.latitude && restaurant.longitude) {
            const coordinates = [restaurant.longitude, restaurant.latitude];
            bounds.extend(coordinates);
            restaurantsWithCoordinates.push({
              ...restaurant,
              coordinates,
            });
          }
        }

        const newMap = new mapboxgl.default.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v11',
          bounds: bounds,
          fitBoundsOptions: { padding: 50 },
          minZoom: 3,
          maxZoom: 15,
        });

        newMap.addControl(new mapboxgl.default.NavigationControl(), 'top-right');

        restaurantsWithCoordinates.forEach((restaurant) => {
          const el = document.createElement('div');
          el.className = 'restaurant-marker';
          el.style.backgroundColor = '#ff5a1f';
          el.style.width = '24px';
          el.style.height = '24px';
          el.style.borderRadius = '50%';
          el.style.border = '3px solid white';
          el.style.boxShadow = '0 0 3px rgba(0,0,0,0.4)';
          el.style.cursor = 'pointer';

          const popup = new mapboxgl.default.Popup({ offset: 25 }).setHTML(
            `<div style="padding: 8px;">
              <h3 style="font-weight: bold; margin-bottom: 4px; font-size: 14px;">${restaurant.name}</h3>
              <p style="margin: 0; font-size: 12px;">${restaurant.cuisine}</p>
            </div>`
          );

          const marker = new mapboxgl.default.Marker(el)
            .setLngLat(restaurant.coordinates)
            .setPopup(popup)
            .addTo(newMap);

          markers.current.push(marker);
        });

        newMap.on('load', () => {
          setMapLoaded(true);
          map.current = newMap;
        });

        setVisibleRestaurants(restaurantsWithCoordinates);

        newMap.on('moveend', () => {
          const newBounds = newMap.getBounds();
          const newVisibleRestaurants = restaurantsWithCoordinates.filter((restaurant) => {
            return newBounds.contains(restaurant.coordinates);
          });
          setVisibleRestaurants(newVisibleRestaurants);
        });
      } catch (error) {
        console.error('Error initializing map:', error);
      }
    };

    initializeMap();

    return () => {
      if (map.current) {
        map.current.remove();
        markers.current = [];
      }
    };
  }, [restaurants, loading, mapLoaded]);

  const renderStars = (rating = 0) => {
    return (
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'text-orange-500' : 'text-gray-300'}`}
            fill={star <= rating ? 'currentColor' : 'none'}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="bg-gray-800 text-white py-3 px-4">
        <div className="container mx-auto flex items-center justify-between">
          <div className="hidden md:flex items-center space-x-4">
            <div className="bg-white text-gray-800 py-2 px-3 rounded-md flex items-center">
              <Calendar className="h-5 w-5 mr-2 text-gray-500" />
              <span>{format(parseISO(date), 'MMMM d, yyyy')}</span>
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
          <Link to="/" className="text-white hover:underline">Modify search</Link>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <div className="w-full md:w-1/2 lg:w-2/5 flex flex-col overflow-hidden border-r border-gray-200">
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
                {visibleRestaurants.map((restaurant) => (
                  <div key={restaurant.restaurantId} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start">
                      <div className="w-1/4 mr-4">
                        <img
                          src={restaurant.photoUrl}
                          alt={restaurant.name}
                          className="w-full h-24 object-cover rounded-md"
                        />
                      </div>
                      <div className="flex-1">
                        <Link to={`/restaurant/${restaurant.restaurantId}?date=${date}&time=${time}&partySize=${partySize}`}>
                          <h3 className="text-lg font-bold mb-1 hover:text-orange-600">{restaurant.name}</h3>
                        </Link>

                        <div className="flex items-center mb-1">
                          {renderStars(restaurant.averageRating)}
                          <span className="ml-2 text-sm text-gray-600">
                            ({restaurant.totalReviews || 0} review{restaurant.totalReviews !== 1 ? 's' : ''})
                          </span>
                          {restaurant.bookingsToday > 0 && (
                            <span className="ml-3 flex items-center bg-orange-100 text-orange-600 text-xs px-2 py-1 rounded-full animate-pulse">
                              <Flame className="h-4 w-4 mr-1" /> {restaurant.bookingsToday} today
                            </span>
                          )}
                        </div>

                        <div className="flex items-center text-sm text-gray-600 mb-3">
                          <span>{restaurant.cuisine}</span>
                          <span className="mx-2">•</span>
                          <span>{restaurant.costRating}</span>
                          <span className="mx-2">•</span>
                          <span>{restaurant.city}, {restaurant.state}</span>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {getSurroundingSlots(time).map((timeSlot) => (
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

        <div className="hidden md:block md:w-1/2 lg:w-3/5 relative h-full overflow-hidden">
          <div ref={mapContainer} className="absolute inset-0 w-full h-full" />
          {!mapLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
            </div>
          )}
          <div className="absolute top-3 right-3 z-10 flex flex-col space-y-2">
            <button className="bg-white p-2 rounded-md shadow-md hover:bg-gray-100" title="Zoom in" onClick={() => map.current && map.current.zoomIn()}>
              <Plus className="h-5 w-5 text-gray-700" />
            </button>
            <button className="bg-white p-2 rounded-md shadow-md hover:bg-gray-100" title="Zoom out" onClick={() => map.current && map.current.zoomOut()}>
              <Minus className="h-5 w-5 text-gray-700" />
            </button>
            <button className="bg-white p-2 rounded-md shadow-md hover:bg-gray-100" title="Full screen" onClick={() => {
              if (map.current) {
                if (document.fullscreenElement) {
                  document.exitFullscreen();
                } else {
                  mapContainer.current.requestFullscreen();
                }
              }
            }}>
              <Maximize className="h-5 w-5 text-gray-700" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
