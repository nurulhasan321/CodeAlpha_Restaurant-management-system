import api from './axios';

const inventoryApi = {
  getAllItems: async () => {
    const response = await api.get('/api/inventory');
    return response.data;
  },

  addItem: async (data) => {
    const response = await api.post('/api/inventory/add', data);
    return response.data;
  },

  restockItem: async (id, additionalQuantity) => {
    const response = await api.put(`/api/inventory/${id}/restock?additionalQuantity=${additionalQuantity}`);
    return response.data;
  },

  deleteItem: async (id) => {
    const response = await api.delete(`/api/inventory/${id}`);
    return response.data;
  },

  updateItem: async (id, data) => {
    const response = await api.put(`/api/inventory/${id}`, data);
    return response.data;
  },

  deductItem: async (id, quantity) => {
    const response = await api.put(`/api/inventory/${id}/deduct?quantity=${quantity}`);
    return response.data;
  }
};

export default inventoryApi;
