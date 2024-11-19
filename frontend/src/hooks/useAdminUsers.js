// src/hooks/useAdminUsers.js
import { useState, useCallback } from 'react';
import { useAuth } from './useAuth';
import toast from 'react-hot-toast';

export const useAdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    if (!token) throw new Error('Authentication required');
    return token.startsWith('Bearer ') ? token : `Bearer ${token}`;
  };

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:5000/api/admin/users', {
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to fetch users');
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err.message);
      toast.error('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUserStatus = async (userId, status) => {
    try {
      setLoading(true);

      const response = await fetch(`http://localhost:5000/api/admin/user/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to update user status');
      }

      await fetchUsers(); // Refresh the list
      toast.success(`User status updated to ${status}`);
    } catch (err) {
      console.error('Error updating user status:', err);
      toast.error(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (userId) => {
    try {
      setLoading(true);

      const response = await fetch(`http://localhost:5000/api/admin/user/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': getAuthHeader(),
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Failed to delete user');
      }

      await fetchUsers(); // Refresh the list
      toast.success('User deleted successfully');
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    users,
    loading,
    error,
    fetchUsers,
    updateUserStatus,
    deleteUser
  };
};

export default useAdminUsers;