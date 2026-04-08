import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Auth Token automatically
api.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem('adminToken');
    const userToken = localStorage.getItem('token'); // Generic user/driver token

    if (adminToken) {
      config.headers.Authorization = `Bearer ${adminToken}`;
    } else if (userToken) {
      config.headers.Authorization = `Bearer ${userToken}`;
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
      return Promise.reject(error.response.data);
    }
    return Promise.reject({ message: 'Network error or server down.' });
  }
);

export default api;
