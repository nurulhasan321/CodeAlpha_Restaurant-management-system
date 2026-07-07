import api from './axios';

const analyticsApi = {
  getDashboardStats: async () => {
    const response = await api.get('/api/analytics/dashboard');
    return response.data;
  }
};

export default analyticsApi;
