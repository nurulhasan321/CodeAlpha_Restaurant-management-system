import api from './axios.js';
export const reportsApi = {
    getDashboard: () => api.get('/reports/dashboard'),
    getDailySales: (params) => api.get('/reports/daily-sales', { params }),
    getMonthlyRevenue: (params) => api.get('/reports/monthly-revenue', { params }),
    getInventoryReport: () => api.get('/reports/inventory'),
    getLowStockReport: () => api.get('/reports/low-stock'),
    getReservationReport: (params) => api.get('/reports/reservations', { params }),
    getOrderReport: (params) => api.get('/reports/orders', { params }),
    getTopSellingItems: (params) => api.get('/reports/top-selling', { params }),
    getCategorySales: (params) => api.get('/reports/category-sales', { params }),
};
