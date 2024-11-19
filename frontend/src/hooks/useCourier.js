// src/hooks/useCourier.js
import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import api from '../services/api';
import toast from 'react-hot-toast';

export const useCourier = () => {
  const [couriers, setCouriers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('Token missing');
    }
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  };

  const fetchCouriers = useCallback(async (filters = {}) => {
    try {
      setLoading(true);
      setError(null);
      const endpoint = user?.isAdmin ? '/admin/couriers' : '/courier';
      const { data } = await api.get(endpoint, { params: filters });
      setCouriers(data);
    } catch (err) {
      console.error('Fetch couriers error:', err);
      setError('Failed to fetch couriers');
      toast.error('Failed to fetch couriers');
    } finally {
      setLoading(false);
    }
  }, [user?.isAdmin]);

  const updateTracking = async (courierId, trackingData) => {
    try {
      setLoading(true);
      setError(null);

      const authHeader = getAuthHeader();

      const response = await fetch('http://localhost:5000/api/admin/tracking-update', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': authHeader
        },
        body: JSON.stringify({
          courierId,
          ...trackingData
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update tracking');
      }

      await fetchCouriers();
      return data;
    } catch (err) {
      console.error('Update tracking error:', err);
      setError(err.message || 'Failed to update tracking status');
      toast.error(err.message || 'Failed to update tracking status');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    couriers,
    loading,
    error,
    fetchCouriers,
    updateTracking
  };
};

export default useCourier;