import api from './axios';

const tableApi = {
  getAllTables: async () => {
    const response = await api.get('/api/table');
    return response.data;
  },

  addTable: async (data) => {
    const response = await api.post('/api/table/add', data);
    return response.data;
  },

  updateTable: async (id, data) => {
    const response = await api.put(`/api/table/${id}`, data);
    return response.data;
  },

  deleteTable: async (id) => {
    const response = await api.delete(`/api/table/${id}`);
    return response.data;
  }
};

export default tableApi;
