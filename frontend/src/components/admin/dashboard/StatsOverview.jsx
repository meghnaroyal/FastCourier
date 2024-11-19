// src/components/admin/dashboard/StatsOverview.jsx

import React, { useState, useEffect } from 'react';
import { Package, Users, DollarSign, Clock, TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import toast from 'react-hot-toast';

const StatCard = ({ title, value, icon: Icon, change, trend }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
        {change && (
          <div className="flex items-center mt-1">
            {trend === 'up' ? (
              <TrendingUp className="w-4 h-4 text-emerald-500 mr-1" />
            ) : (
              <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
            )}
            <span className={`text-sm ${trend === 'up' ? 'text-emerald-600' : 'text-red-600'}`}>
              {change}% from last month
            </span>
          </div>
        )}
      </div>
      <div className="p-3 bg-blue-50 rounded-lg">
        <Icon className="h-6 w-6 text-blue-600" />
      </div>
    </div>
  </div>
);

const RevenueChart = ({ data }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue Overview</h3>
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="revenue" fill="#2563eb" name="Revenue" />
          <Bar dataKey="cost" fill="#7c3aed" name="Cost" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const DeliveryChart = ({ data }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Performance</h3>
    <div className="h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="month" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line type="monotone" dataKey="onTime" stroke="#2563eb" name="On-time Deliveries" />
          <Line type="monotone" dataKey="delayed" stroke="#dc2626" name="Delayed Deliveries" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const RecentActivities = ({ activities }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
    <div className="space-y-4">
      {activities.map((activity, index) => (
        <div key={index} className="flex items-start space-x-3">
          <div className="p-2 bg-blue-50 rounded">
            <Package className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{activity.description}</p>
            <p className="text-xs text-gray-500">
              {new Date(activity.created_at).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const StatsOverview = () => {
  const { user } = useAuth();
  const [data, setData] = useState({
    stats: {
      totalShipments: 0,
      activeUsers: 0,
      monthlyRevenue: 0,
      avgDeliveryTime: 0,
      shipmentGrowth: 0,
      revenueGrowth: 0,
      userGrowth: 0,
      deliveryTimeChange: 0
    },
    revenueData: [],
    deliveryData: [],
    recentActivities: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        const response = await fetch('http://localhost:5000/api/admin/dashboard', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data');
        }

        const result = await response.json();
        setData(result);
      } catch (err) {
        console.error('Dashboard error:', err);
        setError(err.message);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    if (user?.isAdmin) {
      fetchData();
    }
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg">
        <p className="text-red-600">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="mt-1 text-sm text-gray-500">Welcome back! Here's what's happening with your courier system.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Shipments"
          value={data.stats.totalShipments}
          icon={Package}
          change={data.stats.shipmentGrowth}
          trend={data.stats.shipmentGrowth >= 0 ? 'up' : 'down'}
        />
        <StatCard
          title="Active Users"
          value={data.stats.activeUsers}
          icon={Users}
          change={data.stats.userGrowth}
          trend={data.stats.userGrowth >= 0 ? 'up' : 'down'}
        />
        <StatCard
          title="Monthly Revenue"
          value={`₹${data.stats.monthlyRevenue.toLocaleString()}`}
          icon={DollarSign}
          change={data.stats.revenueGrowth}
          trend={data.stats.revenueGrowth >= 0 ? 'up' : 'down'}
        />
        <StatCard
          title="Avg Delivery Time"
          value={`${data.stats.avgDeliveryTime} hours`}
          icon={Clock}
          change={data.stats.deliveryTimeChange}
          trend={data.stats.deliveryTimeChange <= 0 ? 'up' : 'down'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={data.revenueData} />
        <DeliveryChart data={data.deliveryData} />
      </div>

      <RecentActivities activities={data.recentActivities} />
    </div>
  );
};

export default StatsOverview;