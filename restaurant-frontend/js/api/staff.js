import api from './axios.js';
export const staffApi = {
    getAll: (params) => api.get('/staff', { params }),
    getById: (id) => api.get(`/staff/${id}`),
    create: (data) => api.post('/staff', data),
    update: (id, data) => api.put(`/staff/${id}`, data),
    delete: (id) => api.delete(`/staff/${id}`),
    toggleStatus: (id) => api.patch(`/staff/${id}/status`),
};
