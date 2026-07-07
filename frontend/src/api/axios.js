import axios from 'axios';
import { toast } from 'react-toastify';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  withCredentials: true,
});

// Response interceptor for 401 handling and global errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't retried yet, and it's not an auth route
    if (
      error.response?.status === 401 && 
      !originalRequest._retry &&
      !originalRequest.url.includes('/api/auth/login') &&
      !originalRequest.url.includes('/api/auth/refresh')
    ) {
      originalRequest._retry = true;

      try {
        // Attempt to refresh the token using HTTPOnly cookies
        await axios.post(
          `${import.meta.env.VITE_API_BASE_URL || ''}/api/auth/refresh`,
          {}, 
          { withCredentials: true }
        );

        // Retry the original request
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, let the AuthContext handle the redirect to login
        return Promise.reject(refreshError);
      }
    }

    // Global Error Toasting (Skip 401s which are handled above, unless it's login where it's valid to show)
    if (error.response) {
      if (error.response.status !== 401 || originalRequest.url.includes('/api/auth/login')) {
        const message = error.response.data?.message || 'An unexpected error occurred';
        toast.error(message);
      }
    } else {
      toast.error('Network error. Please check your connection.');
    }

    return Promise.reject(error);
  }
);

export default api;
