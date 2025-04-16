// src/pages/Booking.jsx
import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRestaurantDetails } from '@/store/thunks/restaurantThunks';
import { createBooking } from '@/store/thunks/bookingThunks';
import { format } from 'date-fns';
import { CalendarIcon, Clock, Users, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, CheckCircle } from 'lucide-react';

export default function Booking() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  const date = searchParams.get('date') || format(new Date(), 'yyyy-MM-dd');
  const time = searchParams.get('time') || '19:00';
  const partySize = searchParams.get('partySize') || '2';
  
  const [specialRequests, setSpecialRequests] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);
  
  const { currentRestaurant } = useSelector(state => state.restaurant);
  const { loading, error } = useSelector(state => state.booking);
  
  useEffect(() => {
    if (!currentRestaurant || currentRestaurant.restaurantId !== parseInt(id)) {
      dispatch(fetchRestaurantDetails(id));
    }
  }, [dispatch, id, currentRestaurant]);
  
  const handleBookingSubmit = async () => {
    const bookingData = {
      restaurantId: parseInt(id),
      date,
      time,
      partySize: parseInt(partySize),
      specialRequests
    };
    
    const result = await dispatch(createBooking(bookingData));
    if (result.meta.requestStatus === 'fulfilled') {
      setBookingSuccess(true);
      // After successful booking, user will see success message
    }
  };
  
  if (!currentRestaurant) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  const { name, address, city, state, zipCode } = currentRestaurant;
  
  return (
    <div className="container mx-auto px-4 py-8">
      {bookingSuccess ? (
        <div className="max-w-lg mx-auto bg-white rounded-lg shadow-md p-8">
          <div className="text-center mb-6">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Booking Confirmed!</h1>
            <p className="text-gray-600">Your reservation at {name} has been successfully booked.</p>
          </div>
          
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <CalendarIcon className="h-5 w-5 mr-3 text-gray-500" />
                <span>{format(new Date(date), 'EEEE, MMMM d, yyyy')}</span>
              </div>
              
              <div className="flex items-center">
                <Clock className="h-5 w-5 mr-3 text-gray-500" />
                <span>{time}</span>
              </div>
              
              <div className="flex items-center">
                <Users className="h-5 w-5 mr-3 text-gray-500" />
                <span>{partySize} {parseInt(partySize) === 1 ? 'person' : 'people'}</span>
              </div>
              
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-3 text-gray-500" />
                <span>{address}, {city}</span>
              </div>
            </div>
          </div>
          
          <p className="text-sm text-gray-600 mb-6">
            A confirmation has been sent to your email and phone. You can view all your reservations in your account dashboard.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              className="flex-1" 
              onClick={() => navigate('/dashboard')}
            >
              View Reservations
            </Button>
            <Button 
              variant="outline" 
              className="flex-1"
              onClick={() => navigate('/')}
            >
              Return to Home
            </Button>
          </div>
        </div>
      ) : (
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold mb-6">Complete your reservation</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h2 className="text-lg font-semibold mb-4">Reservation Details</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">{name}</h3>
                    <p className="text-sm text-gray-600">{address}, {city}, {state} {zipCode}</p>
                  </div>
                  
                  <div className="flex items-center">
                    <CalendarIcon className="h-5 w-5 mr-3 text-gray-500" />
                    <span>{format(new Date(date), 'EEEE, MMMM d, yyyy')}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-3 text-gray-500" />
                    <span>{time}</span>
                  </div>
                  
                  <div className="flex items-center">
                    <Users className="h-5 w-5 mr-3 text-gray-500" />
                    <span>{partySize} {parseInt(partySize) === 1 ? 'person' : 'people'}</span>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold mb-4">Special Requests (Optional)</h2>
              
              {error && (
                <Alert variant="destructive" className="mb-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    {error}
                  </AlertDescription>
                </Alert>
              )}
              
              <div className="mb-6">
                <Textarea
                  placeholder="Add any special requests or notes for the restaurant..."
                  rows={5}
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                />
                <p className="text-xs text-gray-500 mt-2">
                  Special requests are not guaranteed and are subject to availability.
                </p>
              </div>
              
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleBookingSubmit}
                disabled={loading}
              >
                {loading ? 'Confirming...' : 'Confirm Reservation'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}