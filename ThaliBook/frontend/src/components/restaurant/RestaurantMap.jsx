// src/components/restaurant/RestaurantMap.jsx
import { useEffect, useRef, useState } from 'react';
import 'mapbox-gl/dist/mapbox-gl.css';

export default function RestaurantMap({ restaurant }) {
  const mapContainer = useRef(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapInstance, setMapInstance] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // First effect: Set coordinates from restaurant data
  useEffect(() => {
    if (!restaurant) {
      setError("Restaurant information is missing");
      setLoading(false);
      return;
    }

    if (restaurant.longitude && restaurant.latitude) {
      // Use the coordinates directly from the restaurant data
      setCoordinates([restaurant.longitude, restaurant.latitude]);
      setLoading(false);
      console.log("Using stored coordinates:", [restaurant.longitude, restaurant.latitude]);
    } else if (restaurant.address) {
      // Fallback to geocoding if coordinates are not available
      setError("Coordinates not available for this restaurant");
      setLoading(false);
    } else {
      setError("Restaurant location information is incomplete");
      setLoading(false);
    }
  }, [restaurant]);

  // Second effect: Initialize map once coordinates are available and DOM is ready
  useEffect(() => {
    if (!coordinates || !mapContainer.current || mapLoaded) return;
    
    const initializeMap = async () => {
      try {
        console.log("Initializing map with coordinates:", coordinates);
        // Re-import mapboxgl to ensure it's available
        const mapboxgl = await import('mapbox-gl');
        mapboxgl.default.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
        
        // Check if map container is still in the DOM
        if (!mapContainer.current) {
          console.log("Map container no longer in DOM");
          return;
        }
        
        console.log("Creating map instance");
        const map = new mapboxgl.default.Map({
          container: mapContainer.current,
          style: 'mapbox://styles/mapbox/streets-v11',
          center: coordinates,
          zoom: 14,
          preserveDrawingBuffer: true // Helps with rendering issues
        });
        
        // Force a resize after map is created to ensure proper dimensions
        window.addEventListener('resize', () => {
          if (map) map.resize();
        });
        
        // Add a handler for when the map is ready
        map.on('load', () => {
          console.log("Map loaded successfully");
          setMapLoaded(true);
          setMapInstance(map);
          
          // Force resize to ensure proper rendering
          setTimeout(() => {
            map.resize();
          }, 0);
          
          // Add navigation controls
          map.addControl(new mapboxgl.default.NavigationControl());
          
          // Add marker for restaurant location
          new mapboxgl.default.Marker()
            .setLngLat(coordinates)
            .setPopup(
              new mapboxgl.default.Popup().setHTML(
                `<h3 style="font-weight: bold; margin-bottom: 4px;">${restaurant.name}</h3>
                 <p style="margin: 0;">${restaurant.address}</p>
                 <p style="margin: 0;">${restaurant.city}, ${restaurant.state} ${restaurant.zipCode}</p>`
              )
            )
            .addTo(map);
        });
        
        map.on('error', (e) => {
          console.error("Mapbox error:", e);
          setError("Error loading map");
        });
      } catch (error) {
        console.error("Map initialization error:", error);
        setError(error.message || "Error initializing map");
      }
    };

    initializeMap();
  }, [coordinates, restaurant, mapLoaded]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (mapInstance) {
        console.log("Removing map instance");
        mapInstance.remove();
        
        // Remove resize event listener
        window.removeEventListener('resize', () => {
          if (mapInstance) mapInstance.resize();
        });
      }
    };
  }, [mapInstance]);

  if (loading && !coordinates) {
    return (
      <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
        <p className="ml-2 text-gray-500">Finding location...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-100 rounded-lg h-64 flex items-center justify-center flex-col p-4">
        <p className="text-gray-500 mb-2">Unable to load map</p>
        <p className="text-gray-400 text-sm text-center">{error}</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg overflow-hidden shadow-md">
      <div
        ref={mapContainer}
        className="restaurant-map-container"
      >
        {coordinates && !mapLoaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-70">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-orange-500"></div>
            <p className="ml-2 text-gray-700">Initializing map...</p>
          </div>
        )}
      </div>
      <div className="p-3 bg-white">
        <h3 className="font-medium text-sm mb-1">Location</h3>
        <p className="text-sm text-gray-600">
          {restaurant.address}, {restaurant.city}, {restaurant.state} {restaurant.zipCode}
        </p>
      </div>
    </div>
  );
}