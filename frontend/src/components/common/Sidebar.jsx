import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Home, 
  Package, 
  Search, 
  Calculator, 
  User, 
  Bell, 
  LogOut,
  Settings,
  HelpCircle
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const MenuItem = ({ to, icon: Icon, children, onClick }) => (
  <NavLink
    to={to}
    onClick={onClick}
    className={({ isActive }) =>
      `flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors ${
        isActive ? 'bg-blue-50 text-blue-600 font-medium' : ''
      }`
    }
  >
    <Icon className="h-5 w-5" />
    <span className="flex-1">{children}</span>
  </NavLink>
);

const Sidebar = ({ className = '' }) => {
  const { logout, user } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      // Navigation will be handled by the AuthContext
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <aside className={`flex flex-col h-full bg-white border-r border-gray-200 ${className}`}>
      <div className="flex-1 overflow-y-auto">
        <div className="p-4">
          {/* User Info */}
          <div className="mb-6 pb-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-sm font-medium text-gray-900">{user?.name || 'User'}</h2>
                <p className="text-xs text-gray-500">{user?.email || 'user@example.com'}</p>
              </div>
            </div>
          </div>

          {/* Shipments Section */}
          <div className="mb-6">
            <h2 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              SHIPMENTS
            </h2>
            <nav className="space-y-1">
              <MenuItem to="/dashboard" icon={Home}>
                Dashboard
              </MenuItem>
              <MenuItem to="/create-courier" icon={Package}>
                New Shipment
              </MenuItem>
              <MenuItem to="/couriers" icon={Package}>
                My Shipments
              </MenuItem>
              <MenuItem to="/tracking" icon={Search}>
                Track Shipment
              </MenuItem>
              <MenuItem to="/calculate-price" icon={Calculator}>
                Calculate Price
              </MenuItem>
            </nav>
          </div>

          {/* Account Section */}
          <div className="mb-6">
            <h2 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              ACCOUNT
            </h2>
            <nav className="space-y-1">
              <MenuItem to="/profile" icon={User}>
                Profile
              </MenuItem>
              <MenuItem to="/notifications" icon={Bell}>
                Notifications
              </MenuItem>
            </nav>
          </div>

          
        </div>
      </div>

      {/* Logout Button */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full px-4 py-3 text-gray-700 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;