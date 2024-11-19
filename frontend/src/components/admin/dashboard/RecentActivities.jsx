// src/components/admin/dashboard/RecentActivities.jsx
import React, { useState, useEffect } from 'react';
import { Package, Users, DollarSign } from 'lucide-react';

const RecentActivities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const response = await fetch('/api/admin/dashboard', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('adminToken')}`
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch activities');
        
        const data = await response.json();
        setActivities(data.recentActivities);
      } catch (error) {
        console.error('Error fetching activities:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activities</h3>
      <div className="space-y-4">
        {activities.map((activity, index) => (
          <div key={index} className="flex items-start space-x-3">
            <div className="p-2 bg-blue-50 rounded">
              {activity.entity_type === 'courier' && <Package className="h-4 w-4 text-blue-600" />}
              {activity.entity_type === 'user' && <Users className="h-4 w-4 text-blue-600" />}
              {activity.entity_type === 'payment' && <DollarSign className="h-4 w-4 text-blue-600" />}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{activity.description}</p>
              <p className="text-xs text-gray-500">
                {new Date(activity.created_at).toLocaleDateString()} by{' '}
                {activity.user_name || activity.admin_name}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RecentActivities;
