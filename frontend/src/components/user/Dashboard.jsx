import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Package, TrendingUp, Truck, Clock,
  Plus, Search, Calendar, IndianRupee
} from 'lucide-react';
import LoadingSpinner from '../common/LoadingSpinner';
import { useAuth } from '../../hooks/useAuth';
import toast from 'react-hot-toast';

const DashboardCard = ({ title, value, icon: Icon, className }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="mt-1 text-3xl font-semibold text-gray-900">{value}</p>
      </div>
      <Icon className={`h-10 w-10 ${className}`} />
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    total_shipments: 0,
    pending_shipments: 0,
    in_transit_shipments: 0,
    delivered_shipments: 0,
    total_spent: 0
  });
  const [recentShipments, setRecentShipments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [weight, setWeight] = useState('');
  const [calculatedPrice, setCalculatedPrice] = useState(null);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch('http://localhost:5000/api/courier/dashboard', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch dashboard data');
      }

      const data = await response.json();
      setStats(data.stats);
      setRecentShipments(data.recentShipments || []);
    } catch (err) {
      console.error('Dashboard error:', err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleTrackSubmit = (e) => {
    e.preventDefault();
    if (trackingNumber) {
      navigate(`/tracking/${trackingNumber}`);
    } else {
      toast.error('Please enter a tracking number');
    }
  };

  const calculatePrice = async (e) => {
    e.preventDefault();
    if (!weight || weight <= 0) {
      toast.error('Please enter a valid weight');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/calculate-price', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ weight: parseFloat(weight) })
      });

      const data = await response.json();
      if (response.ok) {
        setCalculatedPrice(data.price);
      } else {
        throw new Error(data.message);
      }
    } catch (error) {
      toast.error(error.message || 'Failed to calculate price');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Welcome Section */}
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Welcome back, {user?.name}!
            </h1>
            <p className="mt-1 text-gray-500">
              Here's an overview of your shipping activity
            </p>
          </div>
          <Link
            to="/create-courier"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Shipment
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          title="Total Shipments" 
          value={stats.total_shipments}
          icon={Package} 
          className="text-blue-600" 
        />
        <DashboardCard 
          title="In Transit" 
          value={stats.in_transit_shipments}
          icon={Truck} 
          className="text-green-600" 
        />
        <DashboardCard 
          title="Delivered" 
          value={stats.delivered_shipments}
          icon={Clock} 
          className="text-purple-600" 
        />
        <DashboardCard 
          title="Total Spent" 
          value={`₹${Number(stats.total_spent || 0).toLocaleString()}`}
          icon={IndianRupee} 
          className="text-yellow-600" 
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Track Shipment */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-900">Track Shipment</h2>
          <p className="mt-1 text-sm text-gray-500">
            Enter tracking number to get instant status
          </p>
          <form onSubmit={handleTrackSubmit} className="mt-4">
            <div className="relative">
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <button
                type="submit"
                className="absolute inset-y-0 right-0 px-4 text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Track
              </button>
            </div>
          </form>
        </div>

        {/* Price Calculator */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-900">Calculate Price</h2>
          <p className="mt-1 text-sm text-gray-500">
            Get instant price estimates for your shipments
          </p>
          <form onSubmit={calculatePrice} className="mt-4 space-y-4">
            <div>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="Weight (kg)"
                min="0.01"
                step="0.01"
                className="block w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            {calculatedPrice !== null && (
              <div className="text-center font-medium text-gray-900">
                Estimated Price: ₹{calculatedPrice.toLocaleString()}
              </div>
            )}
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Calculate
            </button>
          </form>
        </div>

        {/* Upcoming Deliveries */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h2 className="text-lg font-medium text-gray-900">Upcoming Deliveries</h2>
          <p className="mt-1 text-sm text-gray-500">
            Your scheduled deliveries for today
          </p>
          <div className="mt-4">
            {stats.pending_shipments > 0 ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span>{stats.pending_shipments} deliveries scheduled</span>
                  <Link
                    to="/couriers"
                    className="text-blue-600 hover:text-blue-500"
                  >
                    View All
                  </Link>
                </div>
              </div>
            ) : (
              <p className="text-sm text-gray-500">No upcoming deliveries</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Shipments */}
      <div className="bg-white rounded-lg shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">Recent Shipments</h2>
            <Link
              to="/couriers"
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              View All
            </Link>
          </div>
        </div>
        <div className="divide-y divide-gray-200">
          {recentShipments.map((shipment) => (
            <div key={shipment.c_id} className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Tracking #: {shipment.billno}
                  </p>
                  <p className="mt-1 text-sm text-gray-500">
                    From: {shipment.sname} To: {shipment.rname}
                  </p>
                </div>
                <div className="text-right">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    shipment.status === 'Delivered' ? 'bg-green-100 text-green-800' :
                    shipment.status === 'In Transit' ? 'bg-blue-100 text-blue-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {shipment.status}
                  </span>
                  <p className="mt-1 text-sm text-gray-500">
                    {new Date(shipment.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="mt-4 flex justify-end space-x-4">
                <Link
                  to={`/courier/${shipment.c_id}`}
                  className="text-sm font-medium text-blue-600 hover:text-blue-500"
                >
                  View Details
                </Link>
                <Link
                  to={`/tracking/${shipment.billno}`}
                  className="text-sm font-medium text-green-600 hover:text-green-500"
                >
                  Track Shipment
                </Link>
              </div>
            </div>
          ))}
          {recentShipments.length === 0 && (
            <div className="p-6 text-center text-gray-500">
              No recent shipments found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;