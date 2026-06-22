import api from './axios.js';
export const orderApi = {
    getAll: (params) => api.get('/orders', { params }),
    getById: (id) => api.get(`/orders/${id}`),
    create: (data) => api.post('/orders', data),
    update: (id, data) => api.put(`/orders/${id}`, data),
    delete: (id) => api.delete(`/orders/${id}`),
    updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
    getItems: (orderId) => api.get(`/orders/${orderId}/items`),
    addItem: (orderId, data) => api.post(`/orders/${orderId}/items`, data),
    updateItem: (orderId, itemId, data) => api.put(`/orders/${orderId}/items/${itemId}`, data),
    removeItem: (orderId, itemId) => api.delete(`/orders/${orderId}/items/${itemId}`),
};
