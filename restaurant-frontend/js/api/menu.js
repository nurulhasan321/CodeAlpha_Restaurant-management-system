import api from './axios.js';
export const menuApi = {
    getAll: (params) => api.get('/menu-items', { params }),
    getById: (id) => api.get(`/menu-items/${id}`),
    create: (data) => api.post('/menu-items', data),
    update: (id, data) => api.put(`/menu-items/${id}`, data),
    delete: (id) => api.delete(`/menu-items/${id}`),
    toggleAvailability: (id) => api.patch(`/menu-items/${id}/availability`),
    uploadImage: (id, formData) => api.post(`/menu-items/${id}/image`, formData, { headers: { 'Content-Type': 'multipart/form-data' } }),
};
