import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Sidebar from '../common/Sidebar';

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar - Fixed at top */}
      <Navbar className="fixed top-0 left-0 right-0 z-50" />
      
      {/* Main container */}
      <div className="flex pt-16"> {/* Add padding-top to account for fixed navbar */}
        {/* Sidebar - Fixed at left */}
        <Sidebar className="fixed left-0 bottom-0 top-16 w-64 bg-white shadow-sm" />
        
        {/* Main content - Pushed to the right */}
        <main className="flex-1 ml-64 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;