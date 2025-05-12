import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '@/services/api';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import ManagerSidebar from '@/components/layout/ManagerSidebar';
import {
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';

export default function Bookings() {
  // We don't need location anymore since we're using the ManagerSidebar component
  const [bookings, setBookings] = useState([]);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch bookings
      const bookingsResponse = await api.get('/bookings/my');
      setBookings(bookingsResponse.data);

      // Fetch restaurants
      const restaurantsResponse = await api.get('/restaurants/manager');
      setRestaurants(restaurantsResponse.data);
    } catch (err) {
      console.error("Failed to fetch data:", err);
      toast.error("Failed to load bookings");
    } finally {
      setLoading(false);
    }
  };

  // Get restaurant name by ID
  const getRestaurantName = (restaurantId) => {
    const restaurant = restaurants.find(r => r.restaurantId === restaurantId);
    return restaurant ? restaurant.name : 'Unknown Restaurant';
  };

  // Filter bookings by status
  const getBookingsByStatus = (status) => {
    return bookings.filter(booking => booking.status === status);
  };

  const confirmedBookings = getBookingsByStatus('CONFIRMED');
  const pendingBookings = getBookingsByStatus('PENDING');
  const cancelledBookings = getBookingsByStatus('CANCELLED');

  // Group bookings by restaurant
  const groupBookingsByRestaurant = () => {
    const grouped = {};
    bookings.forEach(booking => {
      if (!grouped[booking.restaurantId]) {
        grouped[booking.restaurantId] = [];
      }
      grouped[booking.restaurantId].push(booking);
    });
    return grouped;
  };

  const bookingsByRestaurant = groupBookingsByRestaurant();

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <ManagerSidebar />
        <div className="flex-1 flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <ManagerSidebar />

      {/* Main Content */}
      <div className="flex-1 p-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">All Bookings</h1>
        </div>

        {/* Booking Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4 flex items-center">
            <div className="p-2 rounded-full bg-gray-100 mr-3">
              <Clock className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Bookings</p>
              <p className="text-xl font-bold">{bookings.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 flex items-center">
            <div className="p-2 rounded-full bg-green-100 mr-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Confirmed</p>
              <p className="text-xl font-bold">{confirmedBookings.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 flex items-center">
            <div className="p-2 rounded-full bg-yellow-100 mr-3">
              <Clock className="h-5 w-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Pending</p>
              <p className="text-xl font-bold">{pendingBookings.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-4 flex items-center">
            <div className="p-2 rounded-full bg-red-100 mr-3">
              <XCircle className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Cancelled</p>
              <p className="text-xl font-bold">{cancelledBookings.length}</p>
            </div>
          </div>
        </div>

        {/* Bookings Section */}
        <div className="bg-white rounded-lg shadow-sm overflow-hidden">
          <Tabs defaultValue="all" className="w-full">
            <div className="px-6 pt-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All Bookings</TabsTrigger>
                <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
                <TabsTrigger value="pending">Pending</TabsTrigger>
                <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="all" className="p-6">
              {bookings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No bookings found.</p>
                </div>
              ) : (
                <BookingsList bookings={bookings} getRestaurantName={getRestaurantName} />
              )}
            </TabsContent>

            <TabsContent value="confirmed" className="p-6">
              {confirmedBookings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No confirmed bookings found.</p>
                </div>
              ) : (
                <BookingsList bookings={confirmedBookings} getRestaurantName={getRestaurantName} />
              )}
            </TabsContent>

            <TabsContent value="pending" className="p-6">
              {pendingBookings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No pending bookings found.</p>
                </div>
              ) : (
                <BookingsList bookings={pendingBookings} getRestaurantName={getRestaurantName} />
              )}
            </TabsContent>

            <TabsContent value="cancelled" className="p-6">
              {cancelledBookings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No cancelled bookings found.</p>
                </div>
              ) : (
                <BookingsList bookings={cancelledBookings} getRestaurantName={getRestaurantName} />
              )}
            </TabsContent>
          </Tabs>
        </div>

        {/* Bookings by Restaurant */}
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-4">Bookings by Restaurant</h2>
          {Object.keys(bookingsByRestaurant).length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <p className="text-gray-600">No bookings found.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {Object.entries(bookingsByRestaurant).map(([restaurantId, restaurantBookings]) => (
                <div key={restaurantId} className="bg-white rounded-lg shadow-sm overflow-hidden">
                  <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
                    <h3 className="font-semibold">{getRestaurantName(parseInt(restaurantId))}</h3>
                    <Link to={`/manager/reservations/${restaurantId}`}>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </Link>
                  </div>
                  <div className="p-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-gray-50 rounded p-4 text-center">
                        <p className="text-sm text-gray-500">Total Bookings</p>
                        <p className="text-xl font-bold">{restaurantBookings.length}</p>
                      </div>
                      <div className="bg-green-50 rounded p-4 text-center">
                        <p className="text-sm text-gray-500">Today's Bookings</p>
                        <p className="text-xl font-bold">
                          {restaurantBookings.filter(b => b.date === new Date().toISOString().split('T')[0]).length}
                        </p>
                      </div>
                      <div className="bg-yellow-50 rounded p-4 text-center">
                        <p className="text-sm text-gray-500">Pending Bookings</p>
                        <p className="text-xl font-bold">
                          {restaurantBookings.filter(b => b.status === 'PENDING').length}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BookingsList({ bookings, getRestaurantName }) {
  // Sort bookings by date (newest first) and then by time
  const sortedBookings = [...bookings].sort((a, b) => {
    if (a.date !== b.date) {
      return parseISO(b.date).getTime() - parseISO(a.date).getTime(); // Sort by date descending
    }
    return a.time.localeCompare(b.time); // Then sort by time ascending
  });

  // Group bookings by date
  const bookingsByDate = {};
  sortedBookings.forEach(booking => {
    if (!bookingsByDate[booking.date]) {
      bookingsByDate[booking.date] = [];
    }
    bookingsByDate[booking.date].push(booking);
  });

  return (
    <div className="space-y-6">
      {Object.entries(bookingsByDate).map(([date, dateBookings]) => (
        <div key={date} className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 px-4 py-2 border-b">
            <h3 className="font-medium">{formatDate(date)}</h3>
          </div>
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurant</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Party Size</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {dateBookings.map((booking) => (
                <tr key={booking.bookingId}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatTime(booking.time)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getRestaurantName(booking.restaurantId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    Customer #{booking.userId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {booking.partySize} {booking.partySize === 1 ? 'person' : 'people'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 
                        booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-red-100 text-red-800'}`}>
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" disabled={booking.status !== 'PENDING'}>
                        Confirm
                      </Button>
                      <Button variant="outline" size="sm" disabled={booking.status === 'CANCELLED'}>
                        Cancel
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}

// Helper functions
function formatDate(dateString) {
  return format(parseISO(dateString), 'EEEE, MMMM d, yyyy');
}

function formatTime(timeString) {
  const [hours, minutes] = timeString.split(':');
  const date = new Date();
  date.setHours(parseInt(hours, 10));
  date.setMinutes(parseInt(minutes, 10));
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}