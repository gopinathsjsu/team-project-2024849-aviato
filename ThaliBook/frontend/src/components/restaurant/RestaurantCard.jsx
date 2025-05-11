// src/components/restaurant/RestaurantCard.jsx
import { Link } from 'react-router-dom';
import { MapPin, Star, DollarSign, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RestaurantCard({ restaurant, date, time, partySize }) {
  const { restaurantId, name, cuisine, costRating, address, city, state, photoUrl } = restaurant;
  
  // Generate available time slots (in a real app, this would come from the API)
  const timeSlots = ['17:30', '18:00', '18:30', '19:00', '19:30', '20:00'];
  
  // Format the cost rating
  const costDisplay = Array(costRating.length)
    .fill()
    .map((_, i) => (
      <DollarSign key={i} className="h-4 w-4 inline-block" />
    ));
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="h-48 overflow-hidden">
        <img
          src={photoUrl || 'https://placehold.co/600x400?text=Restaurant'}
          alt={name}
          className="w-full h-full object-cover object-center transition-transform hover:scale-105 duration-300"
        />
      </div>
      
      <div className="p-4">
        <Link to={`/restaurant/${restaurantId}?date=${date}&time=${time}&partySize=${partySize}`}>
          <h3 className="text-xl font-bold mb-1 hover:text-blue-600">{name}</h3>
        </Link>
        
        <div className="flex items-center text-sm text-gray-600 mb-2">
          <div className="flex items-center mr-4">
            {Array(5).fill().map((_, i) => (
              <Star 
                key={i} 
                className={`h-4 w-4 ${i < 4 ? 'text-yellow-400' : 'text-gray-300'}`} 
                fill={i < 4 ? 'currentColor' : 'none'} 
              />
            ))}
            <span className="ml-1">4.0</span>
          </div>
          <div>{cuisine}</div>
        </div>
        
        <div className="flex items-center text-sm text-gray-600 mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span>{city}, {state}</span>
        </div>
        
        <div className="text-sm text-gray-700 mb-3">
          <span className="font-medium">Price:</span> <span>{costDisplay}</span>
        </div>
        
        <div className="mt-4">
          <h4 className="text-sm font-medium mb-2">Available times:</h4>
          <div className="flex flex-wrap gap-2">
            {timeSlots.map(slot => (
              <Button
                key={slot}
                variant="outline"
                size="sm"
                asChild
                className="min-w-16"
              >
                <Link 
                  to={`/restaurant/${restaurantId}?date=${date}&time=${slot}&partySize=${partySize}`}
                >
                  {slot}
                </Link>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}