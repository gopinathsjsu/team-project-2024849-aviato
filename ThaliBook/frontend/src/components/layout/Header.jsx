// src/components/layout/Header.jsx
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '@/store/thunks/authThunks';
import { Button } from '@/components/ui/button';
import { Menu, X, User, LogOut, Settings, Bell } from 'lucide-react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isAuthenticated } = useSelector(state => state.auth);
  const [notifications, setNotifications] = useState([]);
  const { isAuthenticated, user } = useSelector(state => state.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  useEffect(() => {
    const fetchNotifications = async () => {
      if (isAuthenticated) {
        try {
          const response = await fetch('/api/notifications', {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
          });
          const data = await response.json();
          setNotifications(data);
        } catch (error) {
          console.error('Error fetching notifications:', error);
        }
      }
    };

    fetchNotifications();
  }, [isAuthenticated]);

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
                <div className="relative group">
                  <button className="flex items-center text-gray-700 hover:text-orange-600 font-medium">
                    <User className="h-5 w-5 mr-2" />
                    Account
                  </button>
                  {/* Dropdown menu container */}
                  <div className="absolute right-0 w-48 pt-2">
                    {/* Dropdown content */}
                    <div className="bg-white rounded-md shadow-lg py-1 z-50">
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
                <div className="relative group">
                  <Link to="" className="text-gray-700 hover:text-orange-600 font-medium">
                    <Bell className="h-5 w-5 mr-2" />
                  </Link>
                  <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg py-1 hidden group-hover:block">
                    <div className="max-h-96 overflow-y-auto">
                      {notifications?.map((notification, index) => (
                        <div key={index} className="px-4 py-2 hover:bg-orange-50 border-b border-gray-100">
                          <p className="text-sm text-gray-700">{notification.message}</p>
                          <span className="text-xs text-gray-500">{notification.timestamp}</span>
                        </div>
                      ))}
                      {!notifications?.length && (
                        <div className="px-4 py-2 text-sm text-gray-500">
                          No new notifications
                        </div>
                      )}
                    </div>
                  </div>
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