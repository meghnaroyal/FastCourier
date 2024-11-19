const API_URL = 'http://localhost:5000/api';

export const authService = {
  login: async (credentials) => {
    const response = await fetch(${API_URL}/login, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(credentials)
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Login failed');
    }

    if (data.token) {
      localStorage.setItem('authToken', data.token);
    }

    return data;
  },

  register: async (userData) => {
    const formData = new FormData();
    Object.keys(userData).forEach(key => {
      formData.append(key, userData[key]);
    });

    const response = await fetch(${API_URL}/register, {
      method: 'POST',
      body: formData
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Registration failed');
    }

    return data;
  },

  logout: () => {
    localStorage.removeItem('authToken');
  },

  getCurrentUser: async () => {
    const response = await fetch(${API_URL}/profile, {
      headers: {
        'Authorization': Bearer ${localStorage.getItem('authToken')}
      }
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || 'Failed to get user profile');
    }

    return data;
  }
};