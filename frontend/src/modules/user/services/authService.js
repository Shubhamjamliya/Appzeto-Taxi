import api from '../../../shared/api/axiosInstance';

export const userAuthService = {
  signup: (payload) => api.post('/users/signup', payload),
  login: (payload) => api.post('/users/login', payload),
  startOtp: (phone) => api.post('/users/auth/send-otp', { phone }),
  verifyOtp: (phone, otp) => api.post('/users/auth/verify-otp', { phone, otp }),
  verifyOtpLogin: (phone) => api.post('/users/otp-login', { phone }),
  uploadProfileImage: (dataUrl) => api.post('/users/profile-image', { dataUrl }),
  updateCurrentUser: (payload) => api.patch('/users/me', payload),
  getCurrentUser: () => api.get('/users/me'),
  getWallet: () => api.get('/users/wallet'),
  topupWallet: (amount) => api.post('/users/wallet/topup', { amount }),
  transferWallet: (phone, amount) => api.post('/users/wallet/transfer', { phone, amount }),
  createWalletTopupOrder: (amount) => api.post('/users/wallet/razorpay/order', { amount }),
  verifyWalletTopup: (payload) => api.post('/users/wallet/razorpay/verify', payload),
};
