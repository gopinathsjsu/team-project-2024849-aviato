// src/components/layout/Header.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '@/store/thunks/authThunks';
import { fetchNotifications } from '@/store/thunks/notificationThunks';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogOut, Settings, Bell } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated } = useSelector(state => state.auth);
  const { notifications } = useSelector(state => state.notification);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  // Fetch notifications when user is authenticated and periodically refresh
  useEffect(() => {
    if (isAuthenticated) {
      // Fetch notifications immediately
      dispatch(fetchNotifications());
      
      // Set up interval to fetch notifications every minute
      const intervalId = setInterval(() => {
        dispatch(fetchNotifications());
      }, 60000); // 60 seconds
      
      // Clean up interval on unmount
      return () => clearInterval(intervalId);
    }
  }, [dispatch, isAuthenticated]);
  
  const handleLogout = () => {
    dispatch(logoutUser());
    navigate('/');
    setIsMenuOpen(false);
  };
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-30 font-sans">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="font-bold text-xl text-orange-600">
            ThaliBook
          </Link>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-gray-700 hover:text-orange-600 font-medium">
              Home
            </Link>
            
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="text-gray-700 hover:text-orange-600 font-medium">
                  My Reservations
                </Link>
                
                <div className="relative group dropdown-container">
                  <button className="flex items-center text-gray-700 hover:text-orange-600 font-medium">
                    <User className="h-5 w-5 mr-2" />
                    Account
                  </button>
                  
                  {/* Added padding-top to create space between button and dropdown */}
                  <div className="absolute right-0 w-48 pt-2">
                    {/* Dropdown content with hover capability */}
                    <div className="bg-white rounded-md shadow-lg py-1 hidden group-hover:block hover:block transition-opacity duration-300 ease-in-out opacity-100">
                      <Link
                        to="/profile"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                      >
                        <Settings className="h-5 w-5 mr-3" />
                        Profile
                      </Link>
                      
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full text-left px-4 py-2 text-gray-700 hover:bg-orange-50 hover:text-orange-600"
                      >
                        <LogOut className="h-5 w-5 mr-3" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
                <div className="relative">
                  <Link to="/notifications" className="text-gray-700 hover:text-orange-600">
                    <div className="relative">
                      <Bell className="h-5 w-5" />
                      {notifications.length > 0 && (
                        <span className="absolute -top-2 -right-2 bg-orange-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                          {notifications.length > 9 ? '9+' : notifications.length}
                        </span>
                      )}
                    </div>
                  </Link>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="outline" className="border-orange-600 text-orange-600 hover:bg-orange-50">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button>Sign Up</Button>
                </Link>
              </div>
            )}
          </nav>
          
          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-gray-700"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>
      
      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t">
          <div className="container mx-auto px-4 py-3">
            <div className="space-y-3">
              <Link 
                to="/" 
                className="block py-2 text-gray-700 hover:text-orange-600 font-medium"
                onClick={() => setIsMenuOpen(false)}
              >
                Home
              </Link>
              
              {isAuthenticated ? (
                <>
                  <Link 
                    to="/dashboard" 
                    className="block py-2 text-gray-700 hover:text-orange-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    My Reservations
                  </Link>
                  
                  <hr className="my-2" />
                  
                  <Link
                    to="/notifications"
                    className="flex items-center py-2 text-gray-700 hover:text-orange-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Bell className="h-5 w-5 mr-2" />
                    Notifications
                    {notifications.length > 0 && (
                      <span className="ml-2 bg-orange-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {notifications.length > 9 ? '9+' : notifications.length}
                      </span>
                    )}
                  </Link>
                  
                  <Link
                    to="/notifications"
                    className="flex items-center py-2 text-gray-700 hover:text-orange-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Bell className="h-5 w-5 mr-2" />
                    Notifications
                    {notifications.length > 0 && (
                      <span className="ml-2 bg-orange-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {notifications.length > 9 ? '9+' : notifications.length}
                      </span>
                    )}
                  </Link>
                  
                  <Link
                    to="/profile"
                    className="block py-2 text-gray-700 hover:text-orange-600 font-medium"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </Link>
                  
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left py-2 text-gray-700 hover:text-orange-600 font-medium"
                  >
                    Sign Out
                  </button>
                </>
              ) : (
                <div className="flex flex-col space-y-2 pt-2">
                  <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                    <Button variant="outline" className="w-full border-orange-600 text-orange-600">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                    <Button className="w-full">Sign Up</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
