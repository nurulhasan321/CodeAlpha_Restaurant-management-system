// ============================================
// SAVORY — Axios Instance
// Configured HTTP client with JWT interceptors
// ============================================

import { API_BASE_URL } from '../utils/constants.js';
import { auth } from '../utils/auth.js';
import { toast } from '../components/toast.js';

// Create Axios instance
const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    withCredentials: true, // Send HttpOnly cookies automatically
    headers: {
        'Content-Type': 'application/json',
    }
});

// Response Interceptor — Handle errors globally
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const isAuthRequest = error.config?.url?.startsWith('/auth/');

        if (error.response) {
            const { status, data } = error.response;
            
            let backendMessage = 'An unexpected error occurred.';
            if (typeof data === 'string') {
                // If it's HTML, don't show the whole HTML
                if (data.trim().startsWith('<html')) {
                    backendMessage = 'Server error occurred (HTML response)';
                } else {
                    backendMessage = data;
                }
            } else if (data && typeof data === 'object') {
                backendMessage = data.message || data.errorMessage || data.detail || data.error || JSON.stringify(data);
            }

            switch (status) {
                case 401:
                    if (!isAuthRequest) {
                        // Prevent logout if it's a business logic error that the backend mistakenly returned as 401
                        // Since duplicate tables trigger 401, we bypass logout for table operations.
                        const isTableEndpoint = error.config?.url?.includes('/restaurant-table');
                        const msgLower = backendMessage.toLowerCase();
                        
                        if (isTableEndpoint) {
                            toast.error(`Error ${status}`, backendMessage);
                        } else if (msgLower.includes('expired') || msgLower.includes('unauthorized') || backendMessage === 'An unexpected error occurred.') {
                            auth.logout();
                            toast.error('Session Expired', 'Please log in again.');
                        } else {
                            toast.error(`Error ${status}`, backendMessage);
                        }
                    }
                    break;
                case 403:
                    if (!isAuthRequest) {
                        window.location.hash = '#/unauthorized';
                        toast.error(`Error ${status}`, backendMessage);
                    }
                    break;
                default:
                    // For 400, 404, 409, 500 etc.
                    if (!isAuthRequest) {
                        toast.error(`Status ${status}`, backendMessage);
                    }
            }
        } else if (!isAuthRequest) {
            if (error.code === 'ECONNABORTED') {
                toast.error('Timeout', 'Request timed out. Please try again.');
            } else if (!navigator.onLine) {
                toast.error('Offline', 'You appear to be offline. Check your connection.');
            } else {
                toast.error('Network Error', 'Unable to reach the server.');
            }
        }

        return Promise.reject(error);
    }
);

export default api;
