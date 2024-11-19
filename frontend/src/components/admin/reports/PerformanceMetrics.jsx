// src/components/admin/reports/PerformanceMetrics.jsx

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Download } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

// src/components/admin/reports/PerformanceMetrics.jsx (continued)

const MetricCard = ({ title, value, description }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <h4 className="text-sm font-medium text-gray-600">{title}</h4>
    <div className="mt-2 flex items-baseline">
      <p className="text-2xl font-semibold text-gray-900">{value}</p>
      {description && (
        <p className="ml-2 text-sm text-gray-500">{description}</p>
      )}
    </div>
  </div>
);

const PerformanceMetrics = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState({
    deliverySuccessRate: 0,
    avgDeliveryTime: 0,
    customerSatisfaction: 0,
    totalDeliveries: 0,
    successfulDeliveries: 0,
    pendingDeliveries: 0,
    failedDeliveries: 0,
    timelineData: []
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    end: new Date()
  });

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const params = new URLSearchParams({
          start_date: dateRange.start.toISOString().split('T')[0],
          end_date: dateRange.end.toISOString().split('T')[0]
        });

        const response = await fetch(`http://localhost:5000/api/admin/metrics?${params}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch metrics data');
        }

        const data = await response.json();
        setMetrics(data);
      } catch (error) {
        console.error('Error fetching metrics:', error);
        setError(error.message);
        toast.error('Failed to load performance metrics');
      } finally {
        setLoading(false);
      }
    };

    if (user?.isAdmin) {
      fetchMetrics();
    }
  }, [dateRange, user]);

  const handleExport = () => {
    try {
      // Implement export functionality here
      toast.success('Report exported successfully');
    } catch (error) {
      toast.error('Failed to export report');
    }
  };

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
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Performance Metrics</h3>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <input
                type="date"
                className="px-4 py-2 border border-gray-300 rounded-md"
                value={dateRange.start.toISOString().split('T')[0]}
                onChange={(e) => setDateRange(prev => ({ 
                  ...prev, 
                  start: new Date(e.target.value) 
                }))}
              />
            </div>
            <div className="relative">
              <input
                type="date"
                className="px-4 py-2 border border-gray-300 rounded-md"
                value={dateRange.end.toISOString().split('T')[0]}
                onChange={(e) => setDateRange(prev => ({ 
                  ...prev, 
                  end: new Date(e.target.value) 
                }))}
              />
            </div>
            <button 
              className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              onClick={handleExport}
            >
              <Download className="h-4 w-4" />
              Export Report
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <MetricCard
            title="Delivery Success Rate"
            value={`${metrics.deliverySuccessRate}%`}
            description="On-time deliveries"
          />
          <MetricCard
            title="Average Delivery Time"
            value={`${metrics.avgDeliveryTime}h`}
            description="From pickup to delivery"
          />
          <MetricCard
            title="Customer Satisfaction"
            value={`${metrics.customerSatisfaction}%`}
            description="Based on feedback"
          />
        </div>

        {metrics.timelineData && metrics.timelineData.length > 0 && (
          <div className="h-[400px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metrics.timelineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" orientation="left" stroke="#2563eb" />
                <YAxis yAxisId="right" orientation="right" stroke="#dc2626" />
                <Tooltip />
                <Legend />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="successRate"
                  stroke="#2563eb"
                  name="Success Rate"
                />
                <Line
                  yAxisId="right"
                  type="monotone"
                  dataKey="deliveryTime"
                  stroke="#dc2626"
                  name="Delivery Time"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="p-4 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-600 font-medium">Total Deliveries</p>
            <p className="text-2xl font-bold text-blue-900">{metrics.totalDeliveries}</p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <p className="text-sm text-green-600 font-medium">Successful Deliveries</p>
            <p className="text-2xl font-bold text-green-900">{metrics.successfulDeliveries}</p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <p className="text-sm text-yellow-600 font-medium">Pending Deliveries</p>
            <p className="text-2xl font-bold text-yellow-900">{metrics.pendingDeliveries}</p>
          </div>
          <div className="p-4 bg-red-50 rounded-lg">
            <p className="text-sm text-red-600 font-medium">Failed Deliveries</p>
            <p className="text-2xl font-bold text-red-900">{metrics.failedDeliveries}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PerformanceMetrics;