import api from './axios';

const authApi = {
  login: async (credentials) => {
    const response = await api.post('/api/auth/login', credentials);
    return response.data;
  },
  
  registerCustomer: async (data) => {
    const response = await api.post('/api/auth/signup/customer', data);
    return response.data;
  },


  logout: async () => {
    const response = await api.post('/api/auth/logout');
    return response.data;
  },

  checkSession: async () => {
    try {
      const response = await api.get('/api/auth/me');
      return response.data;
    } catch (error) {
      return null;
    }
  },

  getCurrentUser: async () => {
    const response = await api.get('/api/auth/me');
    return response.data;
  },
  
  forgotPassword: async (email) => {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response.data;
  },

  resetPassword: async (email, newPassword) => {
    const response = await api.post('/api/auth/reset-password', { email, newPassword });
    return response.data;
  },

  refreshToken: async () => {
    const response = await api.post('/api/auth/refresh');
    return response.data;
  }
};

export default authApi;
