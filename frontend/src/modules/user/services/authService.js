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
  signup: (payload) => api.post('/users/signup', payload),
  login: (payload) => api.post('/users/login', payload),
  startOtp: (phone) => api.post('/users/auth/send-otp', { phone }),
  verifyOtp: (phone, otp) => api.post('/users/auth/verify-otp', { phone, otp }),
  verifyOtpLogin: (phone) => api.post('/users/otp-login', { phone }),
  loginDemoUser: () => api.post('/users/otp-login', { phone: '9998887776' }),
  uploadProfileImage: (dataUrl) => api.post('/users/profile-image', { dataUrl }),
  updateCurrentUser: (payload) => api.patch('/users/me', payload, withUserAuth()),
  getCurrentUser: () => api.get('/users/me', withUserAuth()),
  getWallet: () => api.get('/users/wallet', withUserAuth()),
  topupWallet: (amount) => api.post('/users/wallet/topup', { amount }, withUserAuth()),
  transferWallet: (phone, amount) => api.post('/users/wallet/transfer', { phone, amount }, withUserAuth()),
};
