// src/pages/Notifications.jsx
import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchNotifications, markNotificationAsRead } from '@/store/thunks/notificationThunks';
import { format, parseISO } from 'date-fns';
import { Bell, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Notifications() {
  const dispatch = useDispatch();
  const { notifications, loading } = useSelector(state => state.notification);
  const { isAuthenticated } = useSelector(state => state.auth);

  useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchNotifications());
    }
  }, [dispatch, isAuthenticated]);

  const handleMarkAsRead = (notificationId) => {
    dispatch(markNotificationAsRead(notificationId));
  };

  // Format the timestamp to a readable format
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return 'Unknown date';
    
    try {
      return format(parseISO(timestamp), 'MMM d, yyyy h:mm a');
    } catch {
      return 'Unknown date';
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Bell className="h-6 w-6 mr-3 text-orange-600" />
          <h1 className="text-2xl font-bold">Notifications</h1>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-orange-500"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <Bell className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h2 className="text-xl font-semibold mb-2">No notifications</h2>
            <p className="text-gray-600">You don't have any unread notifications at the moment.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map(notification => (
              <div 
                key={notification.id} 
                className={`bg-white rounded-lg shadow-md p-4 border-l-4 ${notification.read ? 'border-gray-300' : 'border-orange-500'}`}
              >
                <div className="flex justify-between">
                  <div className="flex-1">
                    <p className="text-gray-800">{notification.message}</p>
                    <p className="text-sm text-gray-500 mt-1">
                      {formatTimestamp(notification.createdAt)}
                    </p>
                  </div>
                  {!notification.read && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-gray-500 hover:text-orange-600"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <CheckCircle className="h-5 w-5" />
                      <span className="ml-1">Mark as read</span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}