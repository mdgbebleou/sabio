import axios from 'axios';

// Dynamically read environment variable or fall back to Django localhost
const BASE_URL = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';

export const api = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Inject Bearer Token safely
api.interceptors.request.use(
  (config) => {
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('access');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (e) {
      console.warn("Could not read token from localStorage", e);
    }

    // Ensure Django trailing slash compatibility
    if (config.url && !config.url.endsWith('/') && !config.url.includes('?')) {
      config.url += '/';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Catch 401 Unauthorized globally without crashing React
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      console.warn('Authentication token missing or invalid.');
    }
    return Promise.reject(error);
  }
);