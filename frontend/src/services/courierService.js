import toast from 'react-hot-toast';

const API_URL = 'http://localhost:5000/api';

// Helper function to get auth token
const getAuthToken = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('Authentication required. Please login.');
  }
  return token;
};

// Helper function to handle API responses
const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }
    throw new Error(data.message || 'Operation failed');
  }
  return data;
};

export const courierService = {
  // Create new courier shipment
  createCourier: async (courierData) => {
    try {
      const formData = new FormData();
      
      // Properly handle file and other data
      Object.keys(courierData).forEach(key => {
        if (courierData[key] !== null && courierData[key] !== undefined) {
          if (key === 'image' && courierData[key] instanceof File) {
            formData.append('image', courierData[key]);
          } else {
            formData.append(key, courierData[key]);
          }
        }
      });

      const response = await fetch(`${API_URL}/courier`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: formData
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Create courier error:', error);
      toast.error(error.message);
      throw error;
    }
  },

  // Get courier details
  getCourier: async (id) => {
    try {
      const response = await fetch(`${API_URL}/courier/${id}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get courier error:', error);
      toast.error(error.message);
      throw error;
    }
  },

  // Get all couriers for user
  getMyCouriers: async () => {
    try {
      const response = await fetch(`${API_URL}/courier`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get couriers error:', error);
      toast.error(error.message);
      throw error;
    }
  },

  // Update tracking information (Admin only)
  updateTracking: async (id, trackingData) => {
    try {
      const response = await fetch(`${API_URL}/admin/tracking-update`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          courierId: id,
          ...trackingData
        })
      });

      const data = await handleResponse(response);
      toast.success('Tracking updated successfully');
      return data;
    } catch (error) {
      console.error('Update tracking error:', error);
      toast.error(error.message);
      throw error;
    }
  },

  // Track courier (Public endpoint)
  trackCourier: async (trackingNumber) => {
    try {
      const response = await fetch(`${API_URL}/courier/track/${trackingNumber}`);
      return await handleResponse(response);
    } catch (error) {
      console.error('Track courier error:', error);
      toast.error(error.message);
      throw error;
    }
  },

  // Calculate shipping price
  calculatePrice: async (weight, zone = 'default') => {
    try {
      const response = await fetch(`${API_URL}/calculate-price`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({ weight, zone })
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Calculate price error:', error);
      toast.error(error.message);
      throw error;
    }
  },

  // Get dashboard stats
  getDashboardStats: async () => {
    try {
      const response = await fetch(`${API_URL}/courier/dashboard`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get dashboard stats error:', error);
      toast.error(error.message);
      throw error;
    }
  },

  // Cancel courier
  cancelCourier: async (id) => {
    try {
      const response = await fetch(`${API_URL}/courier/${id}/cancel`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      const data = await handleResponse(response);
      toast.success('Shipment cancelled successfully');
      return data;
    } catch (error) {
      console.error('Cancel courier error:', error);
      toast.error(error.message);
      throw error;
    }
  },

  // Get courier history
  getCourierHistory: async (id) => {
    try {
      const response = await fetch(`${API_URL}/courier/${id}/history`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Get courier history error:', error);
      toast.error(error.message);
      throw error;
    }
  },

  // Search couriers
  searchCouriers: async (query) => {
    try {
      const response = await fetch(`${API_URL}/courier/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`
        }
      });

      return await handleResponse(response);
    } catch (error) {
      console.error('Search couriers error:', error);
      toast.error(error.message);
      throw error;
    }
  }
};

export default courierService;