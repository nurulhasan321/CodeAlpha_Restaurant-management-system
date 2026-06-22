import api from './axios.js';
export const tableApi = {
    getAll: (params) => api.get('/restaurant-table', { params }),
    getById: (id) => api.get(`/restaurant-table/${id}`),
    create: (data) => api.post('/restaurant-table/add-table', data),
    update: (id, data) => api.put(`/restaurant-table/${id}`, data),
    delete: (id) => api.delete(`/restaurant-table/${id}`),
    updateStatus: (id, status) => api.patch(`/restaurant-table/${id}/status`, { status }),
};
