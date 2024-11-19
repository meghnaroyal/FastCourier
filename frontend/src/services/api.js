// api.js
import axios from 'axios';

const BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = token.startsWith('Bearer ') ? token : `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authService = {
  login: async (credentials) => {
    const { data } = await api.post('/login', credentials);
    if (data.token) {
      const token = `Bearer ${data.token}`;
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(data.user));
    }
    return data;
  },

  register: async (formData) => {
    const { data } = await api.post('/register', formData);
    return data;
  },

  verify: async (isAdmin) => {
    const endpoint = isAdmin ? '/admin/verify' : '/user/profile';
    const { data } = await api.get(endpoint);
    return data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }
};

export const courierService = {
  calculatePrice: async (weight, zone = 'default') => {
    const { data } = await api.post('/calculate-price', { weight, zone });
    return data.price;
  },

  createCourier: async (courierData) => {
    const formData = new FormData();
    Object.keys(courierData).forEach(key => {
      formData.append(key, courierData[key]);
    });
    const { data } = await api.post('/courier', formData);
    return data;
  },

  getCouriers: async () => {
    const { data } = await api.get('/courier');
    return data;
  },

  getCourierDetails: async (id) => {
    const { data } = await api.get(`/courier/${id}`);
    return data;
  },

  trackCourier: async (billno) => {
    const { data } = await api.get(`/courier/track/${billno}`);
    return data;
  },

  updateTracking: async (courierId, trackingData) => {
    const { data } = await api.post('/admin/tracking-update', {
      courierId,
      ...trackingData
    });
    return data;
  }
};

export const adminService = {
  getDashboardStats: async () => {
    const { data } = await api.get('/admin/dashboard');
    return data;
  },

  getUsers: async () => {
    const { data } = await api.get('/admin/users');
    return data;
  },

  updateUserStatus: async (userId, status) => {
    const { data } = await api.put(`/admin/user/${userId}`, { status });
    return data;
  },

  searchCouriers: async (query) => {
    const { data } = await api.get('/admin/search', { params: { query } });
    return data;
  },

  getActivityLogs: async () => {
    const { data } = await api.get('/admin/logs');
    return data;
  },

  getContacts: async () => {
    const { data } = await api.get('/admin/contacts');
    return data;
  },

  updateContact: async (id, updateData) => {
    const { data } = await api.put(`/admin/contact/${id}`, updateData);
    return data;
  },

  getPricing: async () => {
    const { data } = await api.get('/admin/pricing');
    return data;
  },

  updatePricing: async (pricingData) => {
    const { data } = await api.post('/admin/pricing', pricingData);
    return data;
  }
};

export default api;