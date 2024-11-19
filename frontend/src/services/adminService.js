// src/services/adminService.js
import axios from 'axios';

const API_URL = 'http://localhost:5000/api/admin';

const createAxiosInstance = () => {
  const instance = axios.create({
    baseURL: API_URL,
    headers: {
      'Content-Type': 'application/json'
    }
  });

  // Add request interceptor
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('adminToken');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Add response interceptor
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        // Handle unauthorized access
        localStorage.removeItem('adminToken');
        localStorage.removeItem('userData');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

const api = createAxiosInstance();

export const adminService = {
  // Dashboard
  getDashboardStats: () => api.get('/dashboard-stats'),
  getRevenueStats: () => api.get('/revenue-stats'),
  getDeliveryPerformance: () => api.get('/delivery-performance'),
  
  // Users
  getUsers: () => api.get('/users'),
  updateUser: (id, data) => api.put(`/user/${id}`, data),
  deleteUser: (id) => api.delete(`/user/${id}`),
  
  // Couriers
  getCouriers: () => api.get('/couriers'),
  updateCourier: (id, data) => api.put(`/courier/${id}`, data),
  deleteCourier: (id) => api.delete(`/courier/${id}`),
  
  // Pricing
  getPricingRules: () => api.get('/pricing'),
  addPricingRule: (data) => api.post('/pricing', data),
  updatePricingRule: (id, data) => api.put(`/pricing/${id}`, data),
  deletePricingRule: (id) => api.delete(`/pricing/${id}`)
};