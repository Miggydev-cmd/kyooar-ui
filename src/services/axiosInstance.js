import axios from 'axios';
import { getBackendUrl } from './api';
import { getNavigator } from './navigationService';

const axiosInstance = axios.create({
  baseURL: getBackendUrl(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to attach the access token
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token') || sessionStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    // Check if the error is 401 Unauthorized and not already retried
    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true; // Mark as retried to prevent infinite loops

      try {
        const refreshToken = localStorage.getItem('refresh_token') || sessionStorage.getItem('refresh_token');
        const navigate = getNavigator();

        if (!refreshToken) {
          // No refresh token, redirect to login using React Router's navigate
          localStorage.clear();
          sessionStorage.clear();
          if (navigate) {
            navigate('/login', { replace: true });
          } else {
            window.location.href = '/login'; // Fallback
          }
          return Promise.reject(error);
        }

        // Call the backend's token refresh endpoint
        const response = await axios.post(`${getBackendUrl()}/api/token/refresh/`, {
          refresh: refreshToken,
        });

        // Update tokens in storage
        localStorage.setItem('access_token', response.data.access);
        localStorage.setItem('refresh_token', response.data.refresh); // Optional: if refresh token also rotates

        // Retry the original request with the new access token
        originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
        return axiosInstance(originalRequest);

      } catch (refreshError) {
        console.error('Token refresh failed:', refreshError);
        // Refresh failed, clear tokens and redirect to login
        localStorage.clear();
        sessionStorage.clear();
        const navigate = getNavigator();
        if (navigate) {
          navigate('/login', { replace: true });
        } else {
          window.location.href = '/login'; // Fallback
        }
        return Promise.reject(refreshError);
      }
    }
    // For other errors or if already retried, just reject
    return Promise.reject(error);
  }
);

export default axiosInstance; 