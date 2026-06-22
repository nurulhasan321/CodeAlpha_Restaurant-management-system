import api from './axios.js';
export const inventoryApi = {
    getAll: (params) => api.get('/inventory', { params }),
    getById: (id) => api.get(`/inventory/${id}`),
    create: (data) => api.post('/inventory', data),
    update: (id, data) => api.put(`/inventory/${id}`, data),
    delete: (id) => api.delete(`/inventory/${id}`),
    getLowStock: () => api.get('/inventory/low-stock'),
    getTransactions: (params) => api.get('/inventory-transactions', { params }),
    getTransactionsByItem: (itemId) => api.get(`/inventory/${itemId}/transactions`),
};
