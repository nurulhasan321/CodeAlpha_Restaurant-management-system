import api from './axios.js';
export const reservationApi = {
    getAll: (params) => api.get('/reservations', { params }),
    getById: (id) => api.get(`/reservations/${id}`),
    create: (data) => api.post('/reservations', data),
    update: (id, data) => api.put(`/reservations/${id}`, data),
    delete: (id) => api.delete(`/reservations/${id}`),
    updateStatus: (id, status) => api.patch(`/reservations/${id}/status`, { status }),
    checkAvailability: (params) => api.get('/reservations/availability', { params }),
};
