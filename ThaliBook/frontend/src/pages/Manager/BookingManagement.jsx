import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '@/services/api';
import authService from '@/services/authService';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import ManagerSidebar from '@/components/layout/ManagerSidebar';
import {
  Users,
  Clock,
  CheckCircle,
  XCircle,
  MapPin,
  Phone,
  Calendar,
  DollarSign,
  Star,
  Utensils,
  Info,
  Table
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';

export default function BookingManagement() {
  const { id } = useParams();
  const restaurantId = id ? parseInt(id) : null;
  // We don't need location anymore since we're using the ManagerSidebar component
  const [restaurant, setRestaurant] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("Restaurant ID from URL params:", id);
    console.log("Parsed Restaurant ID:", restaurantId);
    if (restaurantId) {
      fetchData();
    } else {
      console.error("Invalid restaurant ID");
      toast.error("Invalid restaurant ID");
      setLoading(false);
    }
  }, [restaurantId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Check authentication status
      const currentUser = authService.getCurrentUser();
      console.log("Current user:", currentUser);
      
      if (!currentUser || currentUser.role !== "RESTAURANT_MANAGER") {
        console.error("Authentication issue: User is not a restaurant manager");
        toast.error("Authentication error: You must be logged in as a restaurant manager");
        setLoading(false);
        return;
      }

      try {
        // Fetch restaurant details
        console.log(`Fetching restaurant details for ID: ${restaurantId}`);
        const restaurantResponse = await api.get(`/restaurants/details/${restaurantId}`);
        console.log("Restaurant details response:", restaurantResponse.data);
        setRestaurant(restaurantResponse.data);
      } catch (restaurantErr) {
        console.error("Failed to fetch restaurant details:", restaurantErr);
        toast.error(`Failed to load restaurant details: ${restaurantErr.response?.status} ${restaurantErr.response?.statusText}`);
        setLoading(false);
        return;
      }

      try {
        // Fetch bookings
        console.log("Fetching bookings");
        const bookingsResponse = await api.get('/bookings/my');
        console.log("Bookings response:", bookingsResponse.data);
        
        // Filter bookings for this restaurant
        const filteredBookings = bookingsResponse.data.filter(
          booking => booking.restaurantId === restaurantId
        );
        console.log("Filtered bookings:", filteredBookings);
        setBookings(filteredBookings);
      } catch (bookingsErr) {
        console.error("Failed to fetch bookings:", bookingsErr);
        toast.error(`Failed to load bookings: ${bookingsErr.response?.status} ${bookingsErr.response?.statusText}`);
      }
    } catch (err) {
      console.error("Failed to fetch data:", err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  // Filter bookings by status
  const getBookingsByStatus = (status) => {
    return bookings.filter(booking => booking.status === status);
  };

  const confirmedBookings = getBookingsByStatus('CONFIRMED');
  const pendingBookings = getBookingsByStatus('PENDING');
  const cancelledBookings = getBookingsByStatus('CANCELLED');

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

  if (!restaurant) {
    return (
      <div className="flex min-h-screen bg-gray-50">
        <ManagerSidebar />
        <div className="flex-1 flex justify-center items-center">
          <div className="text-center">
            <h2 className="text-xl font-bold text-gray-800">Restaurant not found</h2>
            <p className="text-gray-600 mt-2">The restaurant you're looking for doesn't exist or you don't have access to it.</p>
            <Link to="/manager/restaurants" className="mt-4 inline-block">
              <Button className="bg-orange-600 hover:bg-orange-700">
                Back to Restaurants
              </Button>
            </Link>
          </div>
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
          <div>
            <h1 className="text-2xl font-bold">{restaurant.name} - Reservations</h1>
            <p className="text-gray-600">{restaurant.address}, {restaurant.city}</p>
          </div>
          <Link to={`/manager/restaurant/edit/${restaurantId}`}>
            <Button variant="outline">
              Edit Restaurant
            </Button>
          </Link>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Today's Bookings"
            value={bookings.filter(b => b.date === new Date().toISOString().split('T')[0]).length}
            icon={<Clock className="h-6 w-6 text-orange-600" />}
          />
          <StatCard
            title="Confirmed Bookings"
            value={confirmedBookings.length}
            icon={<CheckCircle className="h-6 w-6 text-green-600" />}
          />
          <StatCard
            title="Pending Bookings"
            value={pendingBookings.length}
            icon={<Clock className="h-6 w-6 text-yellow-600" />}
          />
        </div>

        {/* Restaurant Details Section */}
        <div className="mb-8">
          <h2 className="text-xl font-bold mb-4">Restaurant Information</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Basic Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="h-5 w-5 mr-2 text-orange-600" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Address</p>
                      <p className="text-gray-600">{restaurant.address}</p>
                      <p className="text-gray-600">{restaurant.city}, {restaurant.state} {restaurant.zipCode}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Phone className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Contact</p>
                      <p className="text-gray-600">{restaurant.phone}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <Utensils className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Cuisine</p>
                      <p className="text-gray-600">{restaurant.cuisine}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <DollarSign className="h-5 w-5 mr-2 text-gray-500 mt-0.5" />
                    <div>
                      <p className="font-medium">Price Range</p>
                      <p className="text-gray-600">{restaurant.costRating}</p>
                    </div>
                  </div>
                  
                  {restaurant.description && (
                    <div className="border-t pt-4 mt-4">
                      <p className="font-medium mb-2">Description</p>
                      <p className="text-gray-600">{restaurant.description}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Tables and Ratings */}
            <div className="space-y-6">
              {/* Tables Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Table className="h-5 w-5 mr-2 text-orange-600" />
                    Tables Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {restaurant.tables && Object.keys(restaurant.tables).length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                      {Object.entries(restaurant.tables).map(([size, count]) => (
                        <div key={size} className="bg-gray-50 p-4 rounded-lg text-center">
                          <p className="text-2xl font-bold text-orange-600">{count}</p>
                          <p className="text-gray-600">{size}-Person {count === 1 ? 'Table' : 'Tables'}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-600">No table information available</p>
                  )}
                </CardContent>
              </Card>

              {/* Ratings and Reviews */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Star className="h-5 w-5 mr-2 text-orange-600" />
                    Ratings & Reviews
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                      <div className="bg-orange-100 text-orange-800 text-xl font-bold px-3 py-1 rounded-md mr-3">
                        {restaurant.averageRating ? restaurant.averageRating.toFixed(1) : 'N/A'}
                      </div>
                      <div>
                        <p className="font-medium">Average Rating</p>
                        <p className="text-gray-600">{restaurant.totalReviews || 0} reviews</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Operating Hours */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-orange-600" />
                Operating Hours
              </CardTitle>
            </CardHeader>
            <CardContent>
              {restaurant.hours && Object.keys(restaurant.hours).length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Object.entries(restaurant.hours).map(([day, hours]) => (
                    <div key={day} className="flex justify-between p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium">{formatDay(day)}</span>
                      <span className="text-gray-600">{hours}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No operating hours available</p>
              )}
            </CardContent>
          </Card>
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
                  <p className="text-gray-600">No bookings found for this restaurant.</p>
                </div>
              ) : (
                <BookingsList bookings={bookings} />
              )}
            </TabsContent>

            <TabsContent value="confirmed" className="p-6">
              {confirmedBookings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No confirmed bookings found.</p>
                </div>
              ) : (
                <BookingsList bookings={confirmedBookings} />
              )}
            </TabsContent>

            <TabsContent value="pending" className="p-6">
              {pendingBookings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No pending bookings found.</p>
                </div>
              ) : (
                <BookingsList bookings={pendingBookings} />
              )}
            </TabsContent>

            <TabsContent value="cancelled" className="p-6">
              {cancelledBookings.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No cancelled bookings found.</p>
                </div>
              ) : (
                <BookingsList bookings={cancelledBookings} />
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function BookingsList({ bookings }) {
  console.log("BookingsList - bookings:", bookings);
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
                    <span className="font-medium text-orange-600">
                      {(() => {
                        console.log("Booking in render:", booking);
                        return `Customer ${booking.userId || 'Unknown'}`;
                      })()}
                    </span>
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

function StatCard({ title, value, icon }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center">
          <div className="p-2 rounded-full bg-orange-50 mr-4">
            {icon}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
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

function formatDay(dayCode) {
  const dayMap = {
    'Mon': 'Monday',
    'Tue': 'Tuesday',
    'Wed': 'Wednesday',
    'Thu': 'Thursday',
    'Fri': 'Friday',
    'Sat': 'Saturday',
    'Sun': 'Sunday'
  };
  return dayMap[dayCode] || dayCode;
}