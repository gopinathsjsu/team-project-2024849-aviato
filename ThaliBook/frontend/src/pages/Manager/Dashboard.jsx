import { useEffect, useState } from 'react';
import api from '@/services/api';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import authService from '@/services/authService';
import ManagerSidebar from '@/components/layout/ManagerSidebar';
import {
  Building2,
  Users,
  Star,
  PlusCircle,
  Edit,
  BookOpen,
  AlertTriangle,
  BarChart3,
  Clock
} from 'lucide-react';
import {
  Card,
  CardContent
} from '@/components/ui/card';

export default function ManagerDashboard() {
  const [restaurants, setRestaurants] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(null);
  const [stats, setStats] = useState({
    totalRestaurants: 0,
    totalBookings: 0,
    pendingApprovals: 0
  });

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch restaurants
      const restaurantsResponse = await api.get('/restaurants/manager');
      setRestaurants(restaurantsResponse.data);

      // Fetch bookings
      const bookingsResponse = await api.get('/bookings/my');
      setBookings(bookingsResponse.data);

      // Calculate stats
      const approved = restaurantsResponse.data.filter(r => r.isApproved);
      const pending = restaurantsResponse.data.filter(r => !r.isApproved);
      
      setStats({
        totalRestaurants: approved.length,
        totalBookings: bookingsResponse.data.length,
        pendingApprovals: pending.length
      });
    } catch (err) {
      console.error("Failed to fetch manager's data:", err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const approvedRestaurants = restaurants.filter(r => r.isApproved);

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
          <h1 className="text-2xl font-bold">{currentUser?.email?.split('@')[0]}'s Dashboard</h1>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <StatCard
            title="Total Restaurants"
            value={stats.totalRestaurants}
            icon={<Building2 className="h-6 w-6 text-orange-600" />}
          />
          <StatCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon={<BookOpen className="h-6 w-6 text-orange-600" />}
          />
          <StatCard
            title="Pending Approvals"
            value={stats.pendingApprovals}
            icon={<Clock className="h-6 w-6 text-orange-600" />}
          />
        </div>

        {/* Recent Activity Section */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold mb-4">Recent Bookings</h2>
          {bookings.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <p className="text-gray-600">No recent bookings found.</p>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Restaurant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Party Size</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.slice(0, 5).map((booking) => {
                    const restaurant = restaurants.find(r => r.restaurantId === booking.restaurantId);
                    return (
                      <tr key={booking.bookingId}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {restaurant?.name || 'Unknown Restaurant'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.time}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {booking.partySize}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full
                            ${booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' :
                              booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'}`}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {bookings.length > 5 && (
                <div className="px-6 py-3 bg-gray-50 text-right">
                  <Link to="/manager/bookings" className="text-orange-600 hover:text-orange-800 text-sm font-medium">
                    View all bookings
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Restaurant Summary Section */}
        <div>
          <h2 className="text-xl font-semibold mb-4">Your Restaurants</h2>
          {approvedRestaurants.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-6 text-center">
              <p className="text-gray-600 mb-4">You don't have any approved restaurants yet.</p>
              <Link to="/manager/restaurant/add">
                <Button className="bg-orange-600 hover:bg-orange-700">
                  Add Your First Restaurant
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {approvedRestaurants.slice(0, 4).map((restaurant) => (
                <div key={restaurant.restaurantId} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-md flex items-center justify-center mr-3">
                      {restaurant.photoUrl ? (
                        <img
                          src={restaurant.photoUrl}
                          alt={restaurant.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <Star className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div className="flex-grow">
                      <h3 className="text-lg font-semibold text-gray-800">{restaurant.name}</h3>
                      <div className="text-gray-600 text-xs">
                        {restaurant.cuisine || 'Various'} • {restaurant.costRating || '$$$'}
                        {restaurant.averageRating && ` • ${restaurant.averageRating} ★`}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Link to={`/manager/restaurant/edit/${restaurant.restaurantId}`}>
                        <Button variant="outline" size="sm" className="h-8 px-2">
                          <Edit className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                      <Link to={`/manager/reservations/${restaurant.restaurantId}`}>
                        <Button variant="outline" size="sm" className="h-8 px-2">
                          <BookOpen className="h-3.5 w-3.5" />
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
          {approvedRestaurants.length > 0 && (
            <div className="mt-4 text-right">
              <Link to="/manager/restaurants" className="text-orange-600 hover:text-orange-800 text-sm font-medium">
                View all restaurants
              </Link>
            </div>
          )}
        </div>
      </div>
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
