import { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchRestaurantDetails } from '@/store/thunks/restaurantThunks';
import { MapPin, Star, DollarSign, Clock, Calendar, Users, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { format, parseISO } from 'date-fns';
import RestaurantMap from '@/components/restaurant/RestaurantMap';
import RestaurantReview from '@/pages/RestaurantReview';
import { useAuth } from '@/hooks/useAuth';

export default function RestaurantDetails() {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { isAuthenticated } = useAuth();

  const date = searchParams.get('date') || format(new Date(), 'yyyy-MM-dd');
  const time = searchParams.get('time') || '19:00';
  const partySize = searchParams.get('partySize') || '2';

  const { currentRestaurant, loading, error } = useSelector(state => state.restaurant);

  useEffect(() => {
    dispatch(fetchRestaurantDetails(id));
  }, [dispatch, id]);

  const handleBooking = () => {
    if (!isAuthenticated) {
      navigate(`/login?returnUrl=/restaurant/${id}?date=${date}&time=${time}&partySize=${partySize}`);
    } else {
      navigate(`/booking/${id}?date=${date}&time=${time}&partySize=${partySize}`);
    }
  };

  const timeSlots = ['17:30', '18:00', '18:30', '19:00', '19:30', '20:00', '20:30', '21:00'];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-red-500 text-lg">Error loading restaurant details.</p>
        <Button onClick={() => dispatch(fetchRestaurantDetails(id))} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  if (!currentRestaurant) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <p className="text-gray-500 text-lg">Restaurant not found.</p>
      </div>
    );
  }

  const {
    name,
    address,
    city,
    state,
    zipCode,
    phone,
    description,
    cuisine,
    costRating,
    hours,
    photoUrl,
    averageRating,
    totalReviews,
  } = currentRestaurant;

  const costDisplay = Array(costRating?.length || 2)
    .fill()
    .map((_, i) => (
      <DollarSign key={i} className="h-4 w-4 inline-block" />
    ));

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Restaurant Details */}
        <div className="lg:col-span-2">
          <div className="h-80 overflow-hidden rounded-lg mb-6">
            <img
              src={photoUrl || 'https://placehold.co/1200x600?text=Restaurant'}
              alt={name}
              className="w-full h-full object-cover"
            />
          </div>

          <h1 className="text-3xl font-bold mb-4">{name}</h1>

          <div className="flex flex-wrap items-center gap-4 mb-6">
            {/* ⭐ Dynamic Average Rating */}
            <div className="flex items-center">
              {Array(5)
                .fill()
                .map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(averageRating) ? 'text-yellow-400' : 'text-gray-300'
                    }`}
                    fill={i < Math.round(averageRating) ? 'currentColor' : 'none'}
                  />
                ))}
              <span className="ml-2 text-sm text-gray-700">
                {averageRating?.toFixed(1)} ({totalReviews} review{totalReviews !== 1 && 's'})
              </span>
            </div>

            {/* 💲 Cost */}
            <div className="flex items-center">
              <span className="font-medium mr-1">Price:</span>
              <span>{costDisplay}</span>
            </div>

            {/* 🍽 Cuisine */}
            <div>{cuisine}</div>
          </div>

          <div className="flex flex-col gap-3 mb-8">
            <div className="flex items-center">
              <MapPin className="h-5 w-5 mr-2 text-gray-500" />
              <span>
                {address}, {city}, {state} {zipCode}
              </span>
            </div>

            <div className="flex items-center">
              <Phone className="h-5 w-5 mr-2 text-gray-500" />
              <span>{phone}</span>
            </div>

            <div className="flex items-start">
              <Clock className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
              <div>
                {hours &&
                  Object.entries(hours).map(([day, time]) => (
                    <div key={day} className="mb-1">
                      <span className="font-medium">{day}:</span> {time}
                    </div>
                  ))}
              </div>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-3">About</h2>
            <p className="text-gray-700">{description}</p>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-bold mb-3">Location</h2>
            <RestaurantMap restaurant={currentRestaurant} />
          </div>

          {/* ✅ Reviews section */}
          <div className="mb-8">
            <RestaurantReview restaurantId={parseInt(id)} />
          </div>
        </div>

        {/* Booking Section */}
        <div>
          <div className="bg-white rounded-lg shadow-md p-6 sticky top-6">
            <h2 className="text-xl font-bold mb-4">Make a reservation</h2>

            <div className="space-y-4 mb-6">
              <div className="flex items-center">
                <Calendar className="h-5 w-5 mr-3 text-gray-500" />
                <span>{format(parseISO(date), 'EEEE, MMMM d, yyyy')}</span>
              </div>

              <div className="flex items-center">
                <Users className="h-5 w-5 mr-3 text-gray-500" />
                <span>
                  {partySize} {parseInt(partySize) === 1 ? 'person' : 'people'}
                </span>
              </div>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold mb-3">Select a time:</h3>
              <div className="grid grid-cols-3 gap-2">
                {timeSlots.map((slot) => (
                  <Button
                    key={slot}
                    variant={slot === time ? 'default' : 'outline'}
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      const newParams = new URLSearchParams(searchParams);
                      newParams.set('time', slot);
                      navigate(`/restaurant/${id}?${newParams.toString()}`);
                    }}
                  >
                    {slot}
                  </Button>
                ))}
              </div>
            </div>

            <Button className="w-full" size="lg" onClick={handleBooking}>
              Complete reservation
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
