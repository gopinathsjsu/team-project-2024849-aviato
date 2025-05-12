import { useEffect, useState } from 'react';
import api from '@/services/api';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import ManagerSidebar from '@/components/layout/ManagerSidebar';
import {
  PlusCircle,
  Edit,
  BookOpen,
  Clock,
  Star
} from 'lucide-react';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';

export default function Restaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    } catch (err) {
      console.error("Failed to fetch manager's data:", err);
      toast.error("Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const approvedRestaurants = restaurants.filter(r => r.isApproved);
  const pendingRestaurants = restaurants.filter(r => !r.isApproved);

  // Get bookings count for each restaurant
  const getBookingsCount = (restaurantId) => {
    return bookings.filter(b => b.restaurantId === restaurantId).length;
  };

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
          <h1 className="text-2xl font-bold">My Restaurants</h1>
          <Link to="/manager/restaurant/add">
            <Button className="bg-orange-600 hover:bg-orange-700">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Restaurant
            </Button>
          </Link>
        </div>

        <Tabs defaultValue="approved" className="mb-6">
          <TabsList>
            <TabsTrigger value="approved">
              Approved Restaurants
              {approvedRestaurants.length > 0 && (
                <span className="ml-2 bg-gray-200 text-gray-800 text-xs font-medium px-2 py-0.5 rounded-full">
                  {approvedRestaurants.length}
                </span>
              )}
            </TabsTrigger>
            <TabsTrigger value="pending">
              Pending Approval
              {pendingRestaurants.length > 0 && (
                <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded-full">
                  {pendingRestaurants.length}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="approved" className="space-y-6 mt-4">
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
              approvedRestaurants.map((restaurant) => (
                <div key={restaurant.restaurantId} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center mr-4">
                      {restaurant.photoUrl ? (
                        <img
                          src={restaurant.photoUrl}
                          alt={restaurant.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <Star className="h-8 w-8 text-gray-400" />
                      )}
                    </div>

                    <div className="flex-grow">
                      <h2 className="text-xl font-bold text-gray-800">{restaurant.name}</h2>
                      <div className="text-gray-600 text-sm">
                        {restaurant.cuisine} • {restaurant.costRating}
                        {restaurant.averageRating && ` • ${restaurant.averageRating} ★`}
                      </div>
                      <div className="text-gray-600 text-sm mt-1">
                        {restaurant.address}, {restaurant.city}, {restaurant.state}
                      </div>
                    </div>

                    <div className="flex items-center gap-8 ml-auto">
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-800">{restaurant.tables ? Object.keys(restaurant.tables).length : 0}</p>
                        <p className="text-xs text-gray-600">Tables</p>
                      </div>
                      <div className="text-center">
                        <p className="text-2xl font-bold text-gray-800">{getBookingsCount(restaurant.restaurantId)}</p>
                        <p className="text-xs text-gray-600">Bookings</p>
                      </div>
                      <div className="flex gap-2">
                        <Link to={`/manager/restaurant/edit/${restaurant.restaurantId}`}>
                          <Button variant="outline" size="sm" className="flex items-center">
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                        </Link>
                        <Link to={`/manager/reservations/${restaurant.restaurantId}`}>
                          <Button variant="outline" size="sm" className="flex items-center">
                            <BookOpen className="h-4 w-4 mr-1" />
                            Manage
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>

          <TabsContent value="pending" className="space-y-6 mt-4">
            {pendingRestaurants.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <p className="text-gray-600">You don't have any restaurants pending approval.</p>
              </div>
            ) : (
              pendingRestaurants.map((restaurant) => (
                <div key={restaurant.restaurantId} className="bg-white rounded-lg shadow-sm border border-gray-100 p-6">
                  <div className="flex items-start">
                    <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-md flex items-center justify-center mr-4">
                      {restaurant.photoUrl ? (
                        <img
                          src={restaurant.photoUrl}
                          alt={restaurant.name}
                          className="w-full h-full object-cover rounded-md"
                        />
                      ) : (
                        <Star className="h-8 w-8 text-gray-400" />
                      )}
                    </div>

                    <div className="flex-grow">
                      <div className="flex items-center">
                        <h2 className="text-xl font-bold text-gray-800">{restaurant.name}</h2>
                        <span className="ml-2 px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded-full flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Pending Approval
                        </span>
                      </div>
                      <div className="text-gray-600 text-sm">
                        {restaurant.cuisine} • {restaurant.costRating}
                      </div>
                      <div className="text-gray-600 text-sm mt-1">
                        {restaurant.address}, {restaurant.city}, {restaurant.state}
                      </div>
                    </div>

                    <div className="flex gap-2 ml-auto">
                      <Link to={`/manager/restaurant/edit/${restaurant.restaurantId}`}>
                        <Button variant="outline" size="sm" className="flex items-center">
                          <Edit className="h-4 w-4 mr-1" />
                          Edit
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}