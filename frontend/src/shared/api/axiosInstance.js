import axios from 'axios';
import { API_BASE_URL } from './runtimeConfig';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const decodeBase64Url = (value) => {
  const normalized = String(value || '').replace(/-/g, '+').replace(/_/g, '/');
  const padding = (4 - (normalized.length % 4)) % 4;
  return normalized + '='.repeat(padding);
};

const getTokenPayload = (token) => {
  if (!token || typeof token !== 'string') {
    return null;
  }

  try {
    const payload = token.split('.')[1];

    if (!payload) {
      return null;
    }

    return JSON.parse(atob(decodeBase64Url(payload)));
  } catch (_error) {
    return null;
  }
};

const getStoredTokenByRole = (role) => {
  const entries = [
    localStorage.getItem(`${role}Token`),
    localStorage.getItem('token'),
  ].filter(Boolean);

  return entries.find((token) => getTokenPayload(token)?.role === role) || null;
};

// Request Interceptor: Attach Auth Token automatically
api.interceptors.request.use(
  (config) => {
    const requestPath = String(config.url || '').split('?')[0];
    const existingAuthorization = config.headers?.Authorization || config.headers?.authorization;

    if (existingAuthorization) {
      return config;
    }

    const chatRole = localStorage.getItem('chatRole');
    const normalizedChatRole = String(chatRole || '').toLowerCase();
    const userToken = getStoredTokenByRole('user');
    const driverToken = getStoredTokenByRole('driver');
    const adminToken = getStoredTokenByRole('admin') || localStorage.getItem('adminToken');

    const isAdminRoute =
      /^\/admin(\/|$)/.test(requestPath) ||
      /^\/(countries|common\/ride_modules|types\/|on-boarding(?:-|\/|$)|roles\/|permissions\/)/.test(requestPath);
    const isDriverRoute = /^\/drivers?(\/|$)/.test(requestPath);
    const isUserRoute = /^\/rides(\/|$)/.test(requestPath);
    const isChatRoute = /^\/chats?(\/|$)/.test(requestPath);

    let token = null;

    if (isChatRoute) {
      if (normalizedChatRole === 'admin') {
        token = adminToken;
      } else if (normalizedChatRole === 'driver') {
        token = driverToken;
      } else if (normalizedChatRole === 'user') {
        token = userToken;
      }
    } else if (isAdminRoute) {
      token = adminToken;
    } else if (isUserRoute) {
      token = userToken;
    } else if (isDriverRoute) {
      token = driverToken;
    } else {
      token = userToken || driverToken || adminToken;
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
