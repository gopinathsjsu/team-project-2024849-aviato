// src/App.jsx
import { Routes, Route } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';
import PrivateRoute from './routes/PrivateRoute';
import RoleBasedRoute from './routes/RoleBasedRoute';

// Lazy load pages
const Home = lazy(() => import('./pages/Home'));
const Search = lazy(() => import('./pages/Search'));
const RestaurantDetails = lazy(() => import('./pages/RestaurantDetails'));
const Booking = lazy(() => import('./pages/Booking'));
const Profile = lazy(() => import('./pages/Profile'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const ManagerDashboard = lazy(() => import('./pages/Manager/Dashboard'));
const RestaurantEdit = lazy(() => import('./pages/Manager/RestaurantEdit'));
const BookingManagement = lazy(() => import('./pages/Manager/BookingManagement'));
const AdminDashboard = lazy(() => import('./pages/Admin/Dashboard'));
const Approvals = lazy(() => import('./pages/Admin/Approvals'));
const Analytics = lazy(() => import('./pages/Admin/Analytics'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));

function App() {
  return (
    <div className="flex flex-col min-h-svh">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<div className="flex items-center justify-center h-screen">Loading...</div>}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/search" element={<Search />} />
            <Route path="/restaurant/:id" element={<RestaurantDetails />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            {/* Private Routes (for any logged in user) */}
            <Route element={<PrivateRoute />}>
              <Route path="/booking/:id" element={<Booking />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/dashboard" element={<Dashboard />} />
            </Route>
            
            {/* Restaurant Manager Routes */}
            <Route element={<RoleBasedRoute role="RESTAURANT_MANAGER" />}>
              <Route path="/manager/dashboard" element={<ManagerDashboard />} />
              <Route path="/manager/restaurant" element={<RestaurantEdit />} />
              <Route path="/manager/bookings" element={<BookingManagement />} />
            </Route>
            
            {/* Admin Routes */}
            <Route element={<RoleBasedRoute role="ADMIN" />}>
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/approvals" element={<Approvals />} />
              <Route path="/admin/analytics" element={<Analytics />} />
            </Route>
          </Routes>
        </Suspense>
      </main>
      <Footer />
    </div>
  );
}

export default App;