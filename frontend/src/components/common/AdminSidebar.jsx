import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  Package, 
  Settings, 
  ClipboardList,
  DollarSign,
  BarChart2,
  Activity,
  Bell,
  User
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const MenuItem = ({ to, icon: Icon, children }) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      `flex items-center space-x-3 px-4 py-3 text-gray-700 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors ${
        isActive ? 'bg-blue-50 text-blue-600 font-medium' : ''
      }`
    }
  >
    <Icon className="h-5 w-5" />
    <span>{children}</span>
  </NavLink>
);

const AdminSidebar = () => {
  const { user } = useAuth();

  return (
    <aside className="fixed top-16 left-0 w-64 h-[calc(100vh-4rem)] overflow-y-auto bg-white border-r border-gray-200">
      <div className="p-4">
        {/* Admin Info */}
        <div className="mb-6 pb-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div>
              <h2 className="text-sm font-medium text-gray-900">{user?.name}</h2>
              <p className="text-xs text-gray-500">Administrator</p>
            </div>
          </div>
        </div>

        {/* Dashboard Section */}
        <div className="mb-6">
          <h2 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Dashboard
          </h2>
          <nav className="space-y-1">
            <MenuItem to="/admin/dashboard" icon={LayoutDashboard}>
              Overview
            </MenuItem>
            <MenuItem to="/admin/metrics" icon={BarChart2}>
              Performance Metrics
            </MenuItem>
          </nav>
        </div>

        {/* Management Section */}
        <div className="mb-6">
          <h2 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Management
          </h2>
          <nav className="space-y-1">
            <MenuItem to="/admin/users" icon={Users}>
              User Management
            </MenuItem>
            <MenuItem to="/admin/couriers" icon={Package}>
              Courier Management
            </MenuItem>
            <MenuItem to="/admin/pricing" icon={DollarSign}>
              Pricing Management
            </MenuItem>
          </nav>
        </div>

        {/* Reports Section */}
        <div className="mb-6">
          <h2 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            Reports
          </h2>
          <nav className="space-y-1">
            <MenuItem to="/admin/logs" icon={Activity}>
              Activity Logs
            </MenuItem>
            <MenuItem to="/admin/reports" icon={ClipboardList}>
              System Reports
            </MenuItem>
          </nav>
        </div>

        {/* Settings Section */}
        <div className="mb-6">
          <h2 className="px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
            System
          </h2>
          <nav className="space-y-1">
            <MenuItem to="/admin/notifications" icon={Bell}>
              Notifications
            </MenuItem>
            <MenuItem to="/admin/settings" icon={Settings}>
              Settings
            </MenuItem>
          </nav>
        </div>
      </div>
    </aside>
  );
};

export default AdminSidebar;