import axios from 'axios';

// Dynamically reads from VITE_API_BASE_URL in staging, or defaults to local Django server
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor: Automatically injects JWT Bearer token before any request is sent
apiClient.interceptors.request.use((config) => {
  // Check common token storage keys (adjust 'access' or 'token' based on your login response)
  const token = localStorage.getItem('access') || localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});