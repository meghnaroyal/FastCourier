// src/components/admin/reports/DeliveryReport.jsx
// (Uses join query from courier_details view)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Clock, Package, AlertCircle } from 'lucide-react';

const DeliveryReport = ({ dateRange }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDeliveryPerformance = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('adminToken');
        const response = await axios.get('http://localhost:5000/api/admin/delivery-performance', {
          headers: { 'Authorization': `Bearer ${token}` },
          params: dateRange
        });
        setData(response.data);
      } catch (error) {
        console.error('Error fetching delivery performance:', error);
        setError('Failed to load delivery performance data');
      } finally {
        setLoading(false);
      }
    };

    fetchDeliveryPerformance();
  }, [dateRange]);

  if (loading) {
    return <div className="animate-pulse">Loading...</div>;
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-lg flex items-center gap-2">
        <AlertCircle className="h-5 w-5 text-red-500" />
        <span className="text-red-700">{error}</span>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold mb-4">Delivery Performance</h2>
      
      {/* Performance Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-600">Average Delivery Time</span>
          </div>
          <p className="text-2xl font-semibold mt-2">
            {Math.round(data.avgDeliveryHours || 0)} hours
          </p>
        </div>

        <div className="bg-green-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-green-600" />
            <span className="text-sm font-medium text-green-600">On-Time Deliveries</span>
          </div>
          <p className="text-2xl font-semibold mt-2">
            {data.onTimePercentage}%
          </p>
        </div>

        <div className="bg-purple-50 p-4 rounded-lg">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">Total Deliveries</span>
          </div>
          <p className="text-2xl font-semibold mt-2">
            {data.totalDeliveries}
          </p>
        </div>
      </div>

      {/* Detailed Performance Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Count
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Avg Time (hrs)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Min Time (hrs)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Max Time (hrs)
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.statusBreakdown?.map((item) => (
              <tr key={item.status}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                    ${item.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                    item.status === 'In Transit' ? 'bg-blue-100 text-blue-800' : 
                    'bg-yellow-100 text-yellow-800'}`}>
                    {item.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">{item.total_count}</td>
                <td className="px-6 py-4 whitespace-nowrap">{Math.round(item.avg_delivery_hours || 0)}</td>
                <td className="px-6 py-4 whitespace-nowrap">{Math.round(item.min_delivery_hours || 0)}</td>
                <td className="px-6 py-4 whitespace-nowrap">{Math.round(item.max_delivery_hours || 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};