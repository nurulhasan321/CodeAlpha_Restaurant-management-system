import api from './axios';

const menuApi = {
  getAllMenus: async () => {
    const response = await api.get('/api/menu');
    return response.data;
  },

  getPopularMenus: async () => {
    // Assuming /api/menu returns all, and we can filter or there's a specific endpoint
    const response = await api.get('/api/menu');
    // Placeholder logic for popular menus if endpoint doesn't specifically sort
    return response.data; 
  },

  addMenu: async (data) => {
    const response = await api.post('/api/menu/add', data);
    return response.data;
  },

  updateMenu: async (id, data) => {
    const response = await api.put(`/api/menu/${id}`, data);
    return response.data;
  },

  deleteMenu: async (id) => {
    const response = await api.delete(`/api/menu/${id}`);
    return response.data;
  }
};

export default menuApi;
