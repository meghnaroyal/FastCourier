import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Bell, Package, Settings, AlertCircle,
  Truck, Check, MapPin, User 
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../common/LoadingSpinner';
import toast from 'react-hot-toast';

const Notifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    fetchNotifications();
  }, [filter]);

  const fetchNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(
        `http://localhost:5000/api/notifications`,
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch notifications');
      }

      const data = await response.json();
      const filteredNotifications = filter === 'unread' 
        ? data.filter(n => !n.is_read)
        : data;
        
      setNotifications(filteredNotifications);
      setUnreadCount(data.filter(n => !n.is_read).length);
    } catch (err) {
      console.error('Fetch notifications error:', err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const response = await fetch(
        `http://localhost:5000/api/notifications/${id}/read`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to mark as read');
      }

      setNotifications(prev =>
        prev.map(notif =>
          notif.id === id ? { ...notif, is_read: true } : notif
        )
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
      toast.success('Marked as read');
    } catch (err) {
      console.error('Mark as read error:', err);
      toast.error(err.message);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type.toLowerCase()) {
      case 'shipment':
        return <Package className="h-5 w-5 text-blue-500" />;
      case 'delivery':
        return <Truck className="h-5 w-5 text-green-500" />;
      case 'account':
        return <User className="h-5 w-5 text-orange-500" />;
      case 'system':
        return <Settings className="h-5 w-5 text-purple-500" />;
      case 'welcome':
        return <Bell className="h-5 w-5 text-indigo-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diff = now - date;
      const seconds = Math.floor(diff / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (days > 7) {
        return date.toLocaleDateString('en-IN', {
          year: 'numeric',
          month: 'short',
          day: 'numeric'
        });
      } else if (days > 0) {
        return `${days} day${days > 1 ? 's' : ''} ago`;
      } else if (hours > 0) {
        return `${hours} hour${hours > 1 ? 's' : ''} ago`;
      } else if (minutes > 0) {
        return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
      } else {
        return 'Just now';
      }
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Bell className="h-6 w-6 text-blue-600" />
            Notifications
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Stay updated with your shipment status and account activities
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4">
        <div className="flex gap-4">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('unread')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              filter === 'unread'
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
            }`}
          >
            Unread {unreadCount > 0 && `(${unreadCount})`}
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <p className="ml-3 text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Notifications List */}
      <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-6 ${
                !notification.is_read 
                  ? 'bg-blue-50 hover:bg-blue-100' 
                  : 'hover:bg-gray-50'
              } transition-colors`}
            >
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {getNotificationIcon(notification.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {notification.title}
                      </p>
                      <p className="mt-1 text-sm text-gray-500">
                        {notification.message}
                      </p>
                    </div>
                    <span className="text-sm text-gray-500 whitespace-nowrap ml-4">
                      {formatDate(notification.created_at)}
                    </span>
                  </div>
                </div>
                {!notification.is_read && (
                  <button
                    onClick={() => markAsRead(notification.id)}
                    className="flex-shrink-0 p-2 text-blue-600 hover:text-blue-500 rounded-full hover:bg-blue-100 transition-colors"
                    title="Mark as read"
                  >
                    <Check className="h-5 w-5" />
                  </button>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="p-12 text-center">
            <Bell className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No notifications
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {filter === 'unread' 
                ? "You've read all your notifications!"
                : "You're all caught up! Check back later for new notifications."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Notifications;