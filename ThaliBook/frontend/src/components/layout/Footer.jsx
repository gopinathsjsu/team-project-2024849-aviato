// src/components/layout/Footer.jsx
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-auto">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">ThaliBook</h3>
            <p className="text-gray-300 text-sm">
              Find and book restaurant reservations in just a few clicks.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Discover</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-gray-300 hover:text-white">
                  Find Restaurants
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">For Businesses</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/register" className="text-gray-300 hover:text-white">
                  Add Your Restaurant
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">
                  Business Support
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Connect</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-300 hover:text-white">
                  Help Center
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-4">
          <p className="text-sm text-gray-300">
            &copy; {new Date().getFullYear()} ThaliBook. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}