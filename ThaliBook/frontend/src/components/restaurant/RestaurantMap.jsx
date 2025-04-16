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

  // First effect: Get coordinates
  useEffect(() => {
    if (!restaurant || !restaurant.address) {
      setError("Restaurant address information is incomplete");
      setLoading(false);
      return;
    }

    const getCoordinates = async () => {
      try {
        setLoading(true);
        // Dynamically import mapboxgl to ensure it's only loaded in browser context
        const mapboxgl = await import('mapbox-gl');
        mapboxgl.default.accessToken = 'pk.eyJ1IjoicHJ1dGh2aWswOSIsImEiOiJjbTl5bTQ1NzQwM3YyMndvZzF4OXc1a3RxIn0.F9sTscmR-4pV3g-AnFv5Yg';
        
        const address = `${restaurant.address}, ${restaurant.city}, ${restaurant.state} ${restaurant.zipCode}`;
        console.log("Geocoding address:", address);
        
        const response = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(address)}.json?access_token=${mapboxgl.default.accessToken}`
        );
        
        if (!response.ok) {
          throw new Error(`Geocoding error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (!data.features || data.features.length === 0) {
          throw new Error("Location not found");
        }
        
        // Store coordinates
        setCoordinates(data.features[0].center);
        console.log("Coordinates set:", data.features[0].center);
      } catch (error) {
        console.error("Geocoding error:", error);
        setError(error.message || "Error finding location");
      } finally {
        setLoading(false);
      }
    };

    getCoordinates();
  }, [restaurant]);

  // Second effect: Initialize map once coordinates are available and DOM is ready
  useEffect(() => {
    if (!coordinates || !mapContainer.current || mapLoaded) return;
    
    const initializeMap = async () => {
      try {
        console.log("Initializing map with coordinates:", coordinates);
        // Re-import mapboxgl to ensure it's available
        const mapboxgl = await import('mapbox-gl');
        mapboxgl.default.accessToken = 'pk.eyJ1IjoicHJ1dGh2aWswOSIsImEiOiJjbTl5bTQ1NzQwM3YyMndvZzF4OXc1a3RxIn0.F9sTscmR-4pV3g-AnFv5Yg';
        
        // Add a small delay to ensure DOM is fully ready
        setTimeout(() => {
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
            zoom: 14
          });
          
          map.on('load', () => {
            console.log("Map loaded successfully");
            setMapLoaded(true);
            setMapInstance(map);
            
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
        }, 300); // Small delay helps ensure DOM is ready
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
        className="h-64 w-full" 
        style={{ minHeight: "250px" }}
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