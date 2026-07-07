import api from './axios';

const categoryApi = {
  getAllCategories: async () => {
    const response = await api.get('/api/category');
    return response.data;
  },

  addCategory: async (data) => {
    const response = await api.post('/api/category/add', data);
    return response.data;
  },

  updateCategory: async (id, data) => {
    const response = await api.put(`/api/category/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id) => {
    const response = await api.delete(`/api/category/${id}`);
    return response.data;
  }
};

export default categoryApi;
