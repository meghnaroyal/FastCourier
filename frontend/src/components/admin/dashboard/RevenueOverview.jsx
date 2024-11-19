// src/components/admin/dashboard/RevenueOverview.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { IndianRupee } from 'lucide-react';

const RevenueOverview = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await axios.get('http://localhost:5000/api/admin/revenue-trends', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setData(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch revenue data');
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
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Revenue Overview</h2>
        <div className="flex items-center text-sm text-gray-500">
          <IndianRupee className="h-4 w-4 mr-1" />
          Total: ₹{data?.totalRevenue?.toLocaleString() || 0}
        </div>
      </div>
      
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data?.trends || []}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip 
              formatter={(value) => [`₹${value.toLocaleString()}`, 'Revenue']}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#3b82f6" 
              name="Revenue" 
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default RevenueOverview;