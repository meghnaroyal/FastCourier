// src/hooks/usePricing.js
import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export const usePricing = () => {
  const [pricingRules, setPricingRules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  };

  const fetchPricingRules = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:5000/api/admin/pricing', {
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch pricing rules');
      }

      const data = await response.json();
      setPricingRules(data);
    } catch (err) {
      console.error('Error fetching pricing rules:', err);
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const addPricingRule = async (ruleData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:5000/api/admin/pricing', {
        method: 'POST',
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ruleData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to add pricing rule');
      }

      toast.success('Pricing rule added successfully');
      await fetchPricingRules();
      return true;
    } catch (err) {
      console.error('Error adding pricing rule:', err);
      setError(err.message);
      toast.error(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updatePricingRule = async (id, ruleData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:5000/api/admin/pricing/${id}`, {
        method: 'PUT',
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(ruleData)
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update pricing rule');
      }

      toast.success('Pricing rule updated successfully');
      await fetchPricingRules();
      return true;
    } catch (err) {
      console.error('Error updating pricing rule:', err);
      setError(err.message);
      toast.error(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deletePricingRule = async (id) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`http://localhost:5000/api/admin/pricing/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': getAuthHeader()
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete pricing rule');
      }

      toast.success('Pricing rule deleted successfully');
      await fetchPricingRules();
      return true;
    } catch (err) {
      console.error('Error deleting pricing rule:', err);
      setError(err.message);
      toast.error(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    pricingRules,
    loading,
    error,
    fetchPricingRules,
    addPricingRule,
    updatePricingRule,
    deletePricingRule
  };
};

export default usePricing;