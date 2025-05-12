// src/pages/Dashboard.jsx
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserBookings, cancelBooking } from '@/store/thunks/bookingThunks';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Calendar, Clock, Users, MapPin, AlertCircle, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import restaurantService from '@/services/restaurantService';

export default function Dashboard() {
  const dispatch = useDispatch();
  const { bookings, loading } = useSelector(state => state.booking);
  const [cancellingId, setCancellingId] = useState(null);
  const [restaurantDetails, setRestaurantDetails] = useState({});
  const [loadingRestaurants, setLoadingRestaurants] = useState(false);
  
  useEffect(() => {
    dispatch(fetchUserBookings());
  }, [dispatch]);
  
  // Fetch restaurant details when bookings change
  useEffect(() => {
    const fetchRestaurantDetails = async () => {
      if (bookings.length === 0) return;
      
      // Get the list of restaurant IDs that we need to fetch
      const restaurantIdsToFetch = bookings
        .filter(booking => booking.restaurantId && !restaurantDetails[booking.restaurantId])
        .map(booking => booking.restaurantId);
      
      // If there are no new restaurant IDs to fetch, return early
      if (restaurantIdsToFetch.length === 0) return;
      
      setLoadingRestaurants(true);
      const detailsMap = { ...restaurantDetails };
      
      try {
        // Create an array of promises for fetching restaurant details
        const promises = restaurantIdsToFetch.map(restaurantId =>
          restaurantService.getRestaurantDetails(restaurantId)
            .then(data => {
              detailsMap[restaurantId] = data;
            })
            .catch(error => {
              console.error(`Error fetching details for restaurant ${restaurantId}:`, error);
            })
        );
        
        await Promise.all(promises);
        setRestaurantDetails(detailsMap);
      } catch (error) {
        console.error("Error fetching restaurant details:", error);
      } finally {
        setLoadingRestaurants(false);
      }
    };
    
    fetchRestaurantDetails();
  }, [bookings]); // Only depend on bookings, not restaurantDetails
  
  const handleCancelBooking = async (bookingId) => {
    setCancellingId(bookingId);
    try {
      await dispatch(cancelBooking(bookingId)).unwrap();
    } catch (error) {
      console.error("Failed to cancel booking:", error);
    } finally {
      setCancellingId(null);
    }
  };
  
  // Function to get status badge styling
  const getStatusBadge = (status) => {
    switch(status) {
      case 'CONFIRMED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <Check className="w-3 h-3 mr-1" />
            Confirmed
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            Pending
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <X className="w-3 h-3 mr-1" />
            Cancelled
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };
  
  if (loading || loadingRestaurants) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">My Reservations</h1>
      
      {bookings.length === 0 ? (
        <div className="text-center py-8 bg-white rounded-lg shadow-sm border border-gray-100">
          <p className="text-gray-500 mb-4">You don't have any reservations yet.</p>
          <Link to="/" className="text-orange-600 hover:text-orange-700 font-medium">
            Find restaurants and make a reservation
          </Link>
        </div>
      ) : (
        <div className="grid gap-6">
          {bookings.map(booking => (
            <div key={booking.bookingId} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div className="flex flex-col md:flex-row">
                {/* Restaurant Image (if available) */}
                {restaurantDetails[booking.restaurantId]?.photoUrl && (
                  <div className="md:w-1/4 h-48 md:h-auto">
                    <img
                      src={restaurantDetails[booking.restaurantId].photoUrl}
                      alt={restaurantDetails[booking.restaurantId]?.name || 'Restaurant'}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                {/* Booking Details */}
                <div className="p-6 flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-800 mb-1">
                        {restaurantDetails[booking.restaurantId]?.name || 'Restaurant'}
                      </h2>
                      <p className="text-gray-600 text-sm flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                        {restaurantDetails[booking.restaurantId] ? (
                          `${restaurantDetails[booking.restaurantId].address},
                           ${restaurantDetails[booking.restaurantId].city},
                           ${restaurantDetails[booking.restaurantId].state}
                           ${restaurantDetails[booking.restaurantId].zipCode}`
                        ) : (
                          'Address loading...'
                        )}
                      </p>
                      {restaurantDetails[booking.restaurantId]?.cuisine && (
                        <p className="text-gray-600 text-xs mt-1">
                          {restaurantDetails[booking.restaurantId].cuisine} •
                          {restaurantDetails[booking.restaurantId].costRating}
                        </p>
                      )}
                    </div>
                    <div>
                      {getStatusBadge(booking.status)}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 mr-2 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Date</p>
                        <p className="text-sm text-gray-600">
                          {booking.date ? format(new Date(booking.date), 'MMM dd, yyyy') : 'Not specified'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 mr-2 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Time</p>
                        <p className="text-sm text-gray-600">
                          {booking.time || 'Not specified'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <Users className="w-5 h-5 mr-2 text-gray-400" />
                      <div>
                        <p className="text-sm font-medium text-gray-700">Party Size</p>
                        <p className="text-sm text-gray-600">
                          {booking.partySize} {booking.partySize === 1 ? 'person' : 'people'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-4">
                    {booking.status !== 'CANCELLED' && (
                      <Button
                        variant="outline"
                        className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                        onClick={() => handleCancelBooking(booking.bookingId)}
                        disabled={cancellingId === booking.bookingId}
                      >
                        {cancellingId === booking.bookingId ? 'Cancelling...' : 'Cancel Reservation'}
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      className="ml-3 text-orange-600 border-orange-200 hover:bg-orange-50 hover:text-orange-700"
                      onClick={() => {
                        window.location.href = `/restaurant/${booking.restaurantId}`;
                      }}
                    >
                      View Restaurant
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}