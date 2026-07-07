import api from './axios';

const orderApi = {
  getAllOrders: async () => {
    const response = await api.get('/api/orders');
    return response.data;
  },

  getMyOrders: async () => {
    const response = await api.get('/api/orders/my-orders');
    return response.data;
  },

  addOrder: async (data) => {
    const response = await api.post('/api/orders/add', data);
    return response.data;
  },

  updateOrderStatus: async (id, status) => {
    const response = await api.put(`/api/orders/${id}/status?status=${status}`);
    return response.data;
  }
};

export default orderApi;
