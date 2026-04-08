import api from '../../../shared/api/axiosInstance';

export const driverService = {
  /**
   * Authentication
   */
  sendOtp: (mobile) => api.post('/mobile-otp', { mobile }),
  
  validateOtp: (mobile, otp) => api.post('/validate-otp', { mobile, otp }),
  
  login: (credentials) => api.post('/driver/login', credentials),

  /**
   * Status / Online State
   */
  getProfile: () => api.get('/driver/profile'),
  
  toggleOnlineStatus: () => api.post('/driver/online-status'),

  /**
   * Trip Management
   */
  getAvailableRequests: () => api.get('/driver/request/available'),
  
  respondToRequest: (requestId, response) => api.post(`/driver/request/respond/${requestId}`, { response }),

  updateLocation: (latitude, longitude) => api.post('/driver/request/update-location', { latitude, longitude }),
};
