// src/components/admin/reports/UserActivityReport.jsx
// (Uses nested query from active_senders view)
import React, { useState, useEffect } from 'react';
import axios from 'axios';
const UserActivityReport = ({ dateRange }) => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
  
    useEffect(() => {
      const fetchUserActivity = async () => {
        try {
          setLoading(true);
          const token = localStorage.getItem('adminToken');
          const response = await axios.get('http://localhost:5000/api/admin/user-activity', {
            headers: { 'Authorization': `Bearer ${token}` },
            params: dateRange
          });
          setData(response.data);
        } catch (error) {
          console.error('Error fetching user activity:', error);
          setError('Failed to load user activity data');
        } finally {
          setLoading(false);
        }
      };
  
      fetchUserActivity();
    }, [dateRange]);
  
    if (loading) return <div className="animate-pulse">Loading...</div>;
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
        <h2 className="text-lg font-semibold mb-4">User Activity Report</h2>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Shipments
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Spent
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Success Rate
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Shipment
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {data.map((user) => (
                <tr key={user.u_id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">{user.total_shipments}</td>
                  <td className="px-6 py-4 whitespace-nowrap">₹{user.total_spent.toLocaleString()}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${user.success_rate >= 90 ? 'bg-green-100 text-green-800' : 
                      user.success_rate >= 75 ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'}`}>
                      {user.success_rate}%
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.last_shipment_date).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  
  export default UserActivityReport;