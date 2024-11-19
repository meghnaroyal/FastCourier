import React from 'react';
import { Toaster } from 'react-hot-toast'; // Add this import
import { Routes, Route, Navigate, useLocation, BrowserRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

// Layout Components
import MainLayout from './components/layouts/MainLayout';
import AdminLayout from './components/layouts/AdminLayout';
import AuthLayout from './components/layouts/AuthLayout';

// Auth Components
import LoginForm from './components/auth/LoginForm';
import RegisterForm from './components/auth/RegisterForm';

// User Components
import Dashboard from './components/user/Dashboard';
import Profile from './components/user/Profile';
import Notifications from './components/user/Notifications';

// Courier Components
import CreateCourierForm from './components/courier/CreateCourierForm';
import CourierList from './components/courier/CourierList';
import CourierDetails from './components/courier/CourierDetails';
import TrackingHistory from './components/courier/TrackingHistory';
import TrackShipment from './components/courier/TrackShipment';
import PriceCalculator from './components/courier/PriceCalculator';

// Admin Components
import StatsOverview from './components/admin/dashboard/StatsOverview';
import CourierManagement from './components/admin/courier/CourierManagement';
import UserManagement from './components/admin/users/UserManagement';
import PricingManagement from './components/admin/pricing/PricingManagement';
import ActivityLogs from './components/admin/reports/ActivityLogs';
import PerformanceMetrics from './components/admin/reports/PerformanceMetrics';
import SystemReports from './components/admin/reports/SystemReports';

// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
  </div>
);

// Protected Route Components
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  // Show loading spinner while checking auth status
  if (loading) {
    return <LoadingSpinner />;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!user.isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  if (user) {
    return <Navigate to={user.isAdmin ? '/admin' : '/'} replace />;
  }

  return children;
};

// Main Routes Component
const AppRoutes = () => {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Public Routes */}
      <Route element={<AuthLayout />}>
        <Route
          path="/login"
          element={
            <PublicRoute>
              <LoginForm />
            </PublicRoute>
          }
        />
        <Route
          path="/register"
          element={
            <PublicRoute>
              <RegisterForm />
            </PublicRoute>
          }
        />
      </Route>

      {/* Protected User Routes */}
      <Route
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="profile" element={<Profile />} />
        <Route path="notifications" element={<Notifications />} />
        <Route path="create-courier" element={<CreateCourierForm />} />
        <Route path="couriers" element={<CourierList />} />
        <Route path="courier/:id" element={<CourierDetails />} />
        <Route path="tracking" element={<TrackShipment />} />
        <Route path="tracking/:id" element={<TrackingHistory />} />
        <Route path="calculate-price" element={<PriceCalculator />} />
      </Route>

      {/* Protected Admin Routes */}
      <Route
        element={
          <AdminRoute>
            <AdminLayout />
          </AdminRoute>
        }
      >
        <Route path="admin" element={<StatsOverview />} />
        <Route path="admin/dashboard" element={<StatsOverview />} />
        <Route path="admin/couriers" element={<CourierManagement />} />
        <Route path="admin/users" element={<UserManagement />} />
        <Route path="admin/pricing" element={<PricingManagement />} />
        <Route path="admin/logs" element={<ActivityLogs />} />
        <Route path="admin/metrics" element={<PerformanceMetrics />} />
        <Route path="admin/reports" element={<SystemReports />} />
      </Route>

      {/* Redirect root to appropriate dashboard */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={user.isAdmin ? "/admin/dashboard" : "/dashboard"} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* 404 Route */}
      <Route path="*" element={
        <div className="min-h-screen flex flex-col items-center justify-center">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
          <p className="text-gray-600 mb-4">Page not found</p>
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go Back
          </button>
        </div>
      } />
    </Routes>
  );
};

// Main App Component
const App = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
          <div className="min-h-screen bg-gray-50">
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  theme: {
                    primary: '#4aed88',
                  },
                },
              }}
            />
            <AppRoutes />
          </div>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;