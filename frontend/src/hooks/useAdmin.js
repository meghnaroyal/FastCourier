import { useEffect, useState } from 'react';
import { useAuth } from './useAuth';
import { adminService } from '../services/api';

export const useAdmin = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user?.isAdmin) {
      fetchDashboardStats();
    }
  }, [user]);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await adminService.getDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Dashboard stats error:', err);
      setError(err.message || 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);

  return {
    stats,
    loading,
    error,
    clearError,
    fetchDashboardStats,
    isAdmin: user?.isAdmin || false
  };
};

export default useAdmin;