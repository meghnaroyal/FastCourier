import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Package, Users, DollarSign, Clock, TrendingUp, TrendingDown } from 'lucide-react';

const StatCard = ({ title, value, icon: Icon, change, trend }) => (
  <Card>
    <CardContent className="pt-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <h3 className="text-2xl font-bold text-gray-900 mt-1">{value}</h3>
          {change && (
            <div className="flex items-center mt-1">
              {trend === 'up' ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
                {change}% from last month
              </span>
            </div>
          )}
        </div>
        <div className="p-3 bg-primary/10 rounded-lg">
          <Icon className="h-6 w-6 text-primary" />
        </div>
      </div>
    </CardContent>
  </Card>
);

const RevenueChart = ({ data }) => (
  <Card>
    <CardHeader>
      <CardTitle>Revenue Overview</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="revenue" fill="#4F46E5" name="Revenue" />
            <Bar dataKey="cost" fill="#9333EA" name="Cost" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
);

const DeliveryMetrics = ({ data }) => (
  <Card>
    <CardHeader>
      <CardTitle>Delivery Performance</CardTitle>
    </CardHeader>
    <CardContent>
      <div className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="onTime" stroke="#4F46E5" name="On-time Deliveries" />
            <Line type="monotone" dataKey="delayed" stroke="#DC2626" name="Delayed Deliveries" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </CardContent>
  </Card>
);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [deliveryData, setDeliveryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const response = await fetch('/api/admin/dashboard', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch dashboard data');
        
        const data = await response.json();
        setStats(data.stats);
        setRevenueData(data.revenueData);
        setDeliveryData(data.deliveryData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-full">Loading...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Overview of your courier system performance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Shipments"
          value={stats.totalShipments}
          icon={Package}
          change={stats.shipmentGrowth}
          trend={stats.shipmentGrowth >= 0 ? 'up' : 'down'}
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers}
          icon={Users}
          change={stats.userGrowth}
          trend={stats.userGrowth >= 0 ? 'up' : 'down'}
        />
        <StatCard
          title="Monthly Revenue"
          value={`₹${stats.monthlyRevenue.toLocaleString()}`}
          icon={DollarSign}
          change={stats.revenueGrowth}
          trend={stats.revenueGrowth >= 0 ? 'up' : 'down'}
        />
        <StatCard
          title="Avg Delivery Time"
          value={`${stats.avgDeliveryTime} hours`}
          icon={Clock}
          change={stats.deliveryTimeChange}
          trend={stats.deliveryTimeChange <= 0 ? 'up' : 'down'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={revenueData} />
        <DeliveryMetrics data={deliveryData} />
      </div>
    </div>
  );
};

export default AdminDashboard;