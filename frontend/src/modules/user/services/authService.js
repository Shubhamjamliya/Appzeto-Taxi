import api from '../../../shared/api/axiosInstance';

export const userAuthService = {
  verifyOtpLogin: (phone) => api.post('/users/otp-login', { phone }),
  getCurrentUser: () => api.get('/users/me'),
};
