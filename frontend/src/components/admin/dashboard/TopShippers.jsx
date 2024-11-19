// src/components/admin/dashboard/TopShippers.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { TrendingUp, Package } from 'lucide-react';

const TopShippers = () => {
  const [shippers, setShippers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShippers = async () => {
      try {
        const token = localStorage.getItem('adminToken');
        const response = await axios.get('http://localhost:5000/api/admin/active-senders', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setShippers(response.data);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch shippers data');
      } finally {
        setLoading(false);
      }
    };

    fetchShippers();
  }, []);

  if (loading) return <div className="h-96 animate-pulse bg-gray-100 rounded-lg"></div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-semibold text-gray-900 mb-6">Top Shippers</h2>
      <div className="space-y-4">
        {shippers.map((shipper) => (
          <div key={shipper.u_id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center">
              <div className="p-2 bg-blue-50 rounded-lg mr-4">
                <Package className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium text-gray-900">{shipper.name}</p>
                <p className="text-sm text-gray-500">{shipper.email}</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-semibold text-gray-900">
                {shipper.total_couriers}
              </div>
              <div className="text-sm text-gray-500">shipments</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TopShippers;