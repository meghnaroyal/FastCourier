// src/components/admin/dashboard/DeliveryPerformance.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Package, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const DeliveryPerformance = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await axios.get('http://localhost:5000/api/admin/delivery-performance', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch delivery data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div className="h-96 animate-pulse bg-gray-100 rounded-lg"></div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Delivery Performance</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center text-blue-600">
            <Clock className="h-5 w-5 mr-2" />
            <span className="font-medium">Avg Time</span>
          </div>
          <p className="text-2xl font-semibold mt-2">
            {Math.round(data?.avgDeliveryTime || 0)} hrs
          </p>
        </div>
        
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center text-green-600">
            <Package className="h-5 w-5 mr-2" />
            <span className="font-medium">Success Rate</span>
          </div>
          <p className="text-2xl font-semibold mt-2">
            {data?.successRate?.toFixed(1)}%
          </p>
        </div>
        
        <div className="bg-yellow-50 p-4 rounded-lg">
          <div className="flex items-center text-yellow-600">
            <AlertCircle className="h-5 w-5 mr-2" />
            <span className="font-medium">Failed Deliveries</span>
          </div>
          <p className="text-2xl font-semibold mt-2">
            {data?.failedCount || 0}
          </p>
        </div>
      </div>

      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data?.trends || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="successRate" 
              stroke="#10B981" 
              name="Success Rate (%)" 
            />
            <Line 
              type="monotone" 
              dataKey="avgTime" 
              stroke="#6366F1" 
              name="Delivery Time (hrs)" 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default DeliveryPerformance;