import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Search } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Navbar = ({ className = '' }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [trackingNumber, setTrackingNumber] = useState('');

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (trackingNumber.trim()) {
      navigate(`/tracking?number=${trackingNumber}`);
      setTrackingNumber('');
    }
  };

  return (
    <nav className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <span className="text-blue-600 text-2xl font-bold">FastCourier</span>
            </Link>
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-2xl px-8">
            <form onSubmit={handleTrackSubmit} className="relative">
              <input
                type="text"
                placeholder="Track your shipment"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                className="w-full px-4 py-2 pl-10 pr-16 text-gray-700 bg-gray-100 border border-transparent rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button 
                type="submit"
                className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Track
              </button>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            </form>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            <Link
              to="/create-courier"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              New Shipment
            </Link>
            
            <button className="p-2 text-gray-500 hover:text-gray-700 relative">
              <Bell className="h-6 w-6" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </button>

            <div className="relative group">
              <button className="flex items-center space-x-2 p-2">
                <img
                  src={user?.profile_image ? `/uploads/${user.profile_image}` : '/default-avatar.png'}
                  alt="Profile"
                  className="h-8 w-8 rounded-full object-cover"
                />
                <span className="text-gray-700">{user?.name}</span>
              </button>

              <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg py-1 hidden group-hover:block">
                <Link
                  to="/profile"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Profile
                </Link>
                <button
                  onClick={logout}
                  className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;