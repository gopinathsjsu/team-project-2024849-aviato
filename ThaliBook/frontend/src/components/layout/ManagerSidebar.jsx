import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Utensils,
  CalendarDays
} from 'lucide-react';

export default function ManagerSidebar() {
  const location = useLocation();
  
  const isActive = (path) => {
    if (path === '/manager/dashboard') {
      return location.pathname === path;
    }
    return location.pathname.includes(path);
  };

  return (
    <div className="w-56 min-h-screen bg-white border-r border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <Link to="/manager/dashboard" className="flex items-center">
          <Utensils className="h-6 w-6 text-orange-600 mr-2" />
          <span className="font-bold text-lg text-gray-800">ThaliBook Manager</span>
        </Link>
      </div>
      
      <nav className="p-4 space-y-1">
        <SidebarLink
          to="/manager/dashboard"
          icon={<LayoutDashboard size={18} />}
          label="Dashboard"
          active={isActive('/manager/dashboard')}
        />
        <SidebarLink
          to="/manager/restaurants"
          icon={<Utensils size={18} />}
          label="Restaurants"
          active={isActive('/manager/restaurants') || isActive('/manager/restaurant/')}
        />
        <SidebarLink
          to="/manager/bookings"
          icon={<CalendarDays size={18} />}
          label="Bookings"
          active={isActive('/manager/bookings') || isActive('/manager/reservations/')}
        />
      </nav>
    </div>
  );
}

function SidebarLink({ to, icon, label, active }) {
  return (
    <Link
      to={to}
      className={`flex items-center px-3 py-2 text-sm rounded-md transition-colors ${
        active
          ? 'text-orange-600 bg-orange-50 font-medium'
          : 'text-gray-600 hover:bg-gray-100'
      }`}
    >
      <span className={`mr-3 ${active ? 'text-orange-600' : 'text-gray-500'}`}>{icon}</span>
      <span>{label}</span>
    </Link>
  );
}