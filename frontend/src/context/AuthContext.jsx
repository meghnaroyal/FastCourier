import React, { createContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const AuthContext = createContext({
  user: null,
  loading: true,
  error: null,
  login: () => {},
  logout: () => {},
  register: () => {},
  updateProfile: () => {},
  isAuthenticated: false,
  isAdmin: false,
  clearError: () => {}
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
    setLoading(false);
  }, []);

  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);
  
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(credentials)
      });
  
      const data = await response.json();
      console.log('Login response:', data);
  
      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }
  
      // For admin users
      if (data.user.isAdmin || data.user.type === 'admin') {
        const userData = {
          ...data.user,
          isAdmin: true,
          type: 'admin'
        };
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        navigate('/admin/dashboard');
      } 
      // For regular users - using the original working code
      else {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setUser(data.user);
        navigate('/dashboard');
      }
  
      toast.success('Login successful!');
      return data;
  
    } catch (err) {
      console.error('Login error:', err);
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);

      const formData = new FormData();
      Object.keys(userData).forEach(key => {
        if (userData[key] !== null && userData[key] !== undefined) {
          if (key === 'profileImage' && userData[key] instanceof File) {
            formData.append('profileImage', userData[key]);
          } else {
            formData.append(key, userData[key]);
          }
        }
      });

      const response = await fetch('http://localhost:5000/api/register', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Registration failed');
      }

      toast.success('Registration successful! Please login.');
      navigate('/login', { 
        state: { 
          message: 'Registration successful! Please login.',
          type: 'success'
        }
      });

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      setLoading(true);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required');
      }

      const formData = new FormData();
      Object.keys(profileData).forEach(key => {
        if (profileData[key] !== null && profileData[key] !== undefined) {
          if (key === 'profileImage' && profileData[key] instanceof File) {
            formData.append('profileImage', profileData[key]);
          } else {
            formData.append(key, profileData[key]);
          }
        }
      });

      const response = await fetch('http://localhost:5000/api/user/profile', {
        method: 'PUT',
        headers: {
          'Authorization': token
        },
        body: formData
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to update profile');
      }

      const updatedUser = { ...user, ...data.user };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    register,
    updateProfile,
    clearError,
    isAuthenticated: !!user,
    isAdmin: user?.isAdmin || false,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthProvider;