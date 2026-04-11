import api from '../../../shared/api/axiosInstance';

const readLocalUserToken = () =>
  localStorage.getItem('userToken') || localStorage.getItem('token') || '';

export const withUserAuth = (config = {}) => {
  const token = readLocalUserToken();

  if (!token) {
    return config;
  }

  return {
    ...config,
    headers: {
      ...(config.headers || {}),
      Authorization: `Bearer ${token}`,
    },
  };
};

export const userAuthService = {
  verifyOtpLogin: (phone) => api.post('/users/otp-login', { phone }),
  getCurrentUser: () => api.get('/users/me', withUserAuth()),
  loginDemoUser: () => api.post('/users/otp-login', { phone: '9998887776' }),
};
