// src/components/admin/reports/ActivityLogs.jsx

import React, { useState, useEffect } from 'react';
import { Search, Download } from 'lucide-react';
import { useAuth } from '../../../context/AuthContext';
import toast from 'react-hot-toast';

const ActivityLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({
    actionType: '',
    dateRange: 'week',
    search: ''
  });

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const params = new URLSearchParams(filter);
        const token = localStorage.getItem('token');

        const response = await fetch(`http://localhost:5000/api/admin/logs?${params}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch logs');
        }

        const data = await response.json();
        setLogs(data);
      } catch (error) {
        console.error('Error fetching logs:', error);
        toast.error('Failed to load activity logs');
      } finally {
        setLoading(false);
      }
    };

    if (user?.isAdmin) {
      fetchLogs();
    }
  }, [filter, user]);

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Activity Logs</h3>
        <div className="flex gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <input
                type="text"
                placeholder="Search logs..."
                className="w-full px-4 py-2 pl-10 border border-gray-300 rounded-md"
                value={filter.search}
                onChange={(e) => setFilter(prev => ({ ...prev, search: e.target.value }))}
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            </div>
          </div>
          <select
            value={filter.actionType}
            onChange={(e) => setFilter(prev => ({ ...prev, actionType: e.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="">All Actions</option>
            <option value="login">Login</option>
            <option value="create_courier">Create Courier</option>
            <option value="update_tracking">Update Tracking</option>
          </select>
          <select
            value={filter.dateRange}
            onChange={(e) => setFilter(prev => ({ ...prev, dateRange: e.target.value }))}
            className="px-4 py-2 border border-gray-300 rounded-md"
          >
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
          </select>
          <button 
            className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            <Download className="h-4 w-4" />
            Export
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Timestamp
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Description
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                IP Address
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan={5} className="text-center py-4">Loading...</td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-4">No activity logs found</td>
              </tr>
            ) : logs.map((log) => (
              <tr key={log.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {new Date(log.created_at).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {log.user_name || log.admin_name || 'System'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {log.action}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">
                  {log.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {log.ip_address}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
export default ActivityLogs;