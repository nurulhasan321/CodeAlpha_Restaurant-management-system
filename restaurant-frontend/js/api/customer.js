import api from './axios.js';
export const customerApi = {
    getAll: (params) => api.get('/customers', { params }),
    getById: (id) => api.get(`/customers/${id}`),
    getOrders: (id) => api.get(`/customers/${id}/orders`),
    getReservations: (id) => api.get(`/customers/${id}/reservations`),
};

