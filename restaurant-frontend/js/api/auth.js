import api from './axios.js';

export const authApi = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/signup/customer', data),
    forgotPassword: (data) => api.post('/auth/forgot-password', data),
    resetPassword: (data) => api.post('/auth/reset-password', data),
    verifyEmail: (token) => api.get(`/auth/verify-email?token=${token}`),
    me: () => api.get('/auth/me'),
    updateProfile: (data) => api.put('/auth/profile', data),
    changePassword: (data) => api.put('/auth/change-password', data),
    logout: () => api.post('/auth/logout'),
};
