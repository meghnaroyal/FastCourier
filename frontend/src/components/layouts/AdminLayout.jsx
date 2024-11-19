import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '../common/AdminSidebar';
import { useAuth } from '../../hooks/useAuth';
import NotificationCenter from '../common/NotificationCenter';

const AdminLayout = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 h-16 z-30">
        <div className="flex items-center justify-between px-6 h-full">
          <div className="flex items-center space-x-4">
            <span className="text-xl font-bold text-blue-600">FastCourier</span>
            <span className="text-sm text-gray-500">Admin Panel</span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">Welcome, {user?.name}</span>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <AdminSidebar />

      {/* Main Content */}
      <main className="ml-64 pt-16">
        <div className="p-6">
          <Outlet />
        </div>
      </main>

      {/* Notification Center */}
      <NotificationCenter />
    </div>
  );
};

export default AdminLayout;