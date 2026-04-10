import axios from 'axios';
import { API_BASE_URL } from './runtimeConfig';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Auth Token automatically
api.interceptors.request.use(
  (config) => {
    const requestPath = String(config.url || '').split('?')[0];
    const existingAuthorization = config.headers?.Authorization || config.headers?.authorization;

    if (existingAuthorization) {
      return config;
    }

    const storedRole = localStorage.getItem('role');
    const chatRole = localStorage.getItem('chatRole');
    const normalizedChatRole = String(chatRole || '').toLowerCase();
    const userToken = localStorage.getItem('userToken') || localStorage.getItem('token');
    const driverToken = localStorage.getItem('driverToken') || localStorage.getItem('token');

    const isAdminRoute =
      /^\/admin(\/|$)/.test(requestPath) ||
      /^\/(countries|common\/ride_modules|types\/|on-boarding(?:-|\/|$)|roles\/|permissions\/)/.test(requestPath);
    const isDriverRoute = /^\/drivers?(\/|$)/.test(requestPath);
    const isChatRoute = /^\/chats?(\/|$)/.test(requestPath);

    let token = null;

    if (isChatRoute) {
      if (normalizedChatRole === 'admin') {
        token = localStorage.getItem('adminToken');
      } else if (normalizedChatRole === 'driver') {
        token = driverToken;
      } else if (normalizedChatRole === 'user') {
        token = userToken;
      }
    } else if (isAdminRoute) {
      token = localStorage.getItem('adminToken');
    } else if (isDriverRoute || storedRole === 'driver') {
      token = driverToken;
    } else if (storedRole === 'user') {
      token = userToken;
    } else if (storedRole === 'admin') {
      token = localStorage.getItem('adminToken');
    } else {
      token = localStorage.getItem('adminToken') || userToken || driverToken;
    }

    if (!token) {
      token = userToken || driverToken || localStorage.getItem('token');
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Simplify responses and handle global errors
api.interceptors.response.use(
  (response) => {
    // Pro-Level: Many APIs return data in data.data or data.result, you can flatten it here
    return response.data;
  },
  (error) => {
    if (error.response) {
      // Global error handling: e.g. 401 logout
      if (error.response.status === 401) {
        console.warn('Unauthorized! Logging out...');
        // Optional: localStorage.clear(); window.location.href = '/login';
      }
      return Promise.reject({ ...error.response.data, status: error.response.status });
    }
    return Promise.reject({ message: 'Network error or server down.' });
  }
);

export default api;
