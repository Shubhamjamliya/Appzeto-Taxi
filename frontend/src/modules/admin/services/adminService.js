import api from '../../../shared/api/axiosInstance';

export const adminService = {
  /**
   * Admin Authentication
   */
  login: (credentials) => api.post('/admin/login', credentials),

  /**
   * User Management
   */
  getUsers: (page = 1, limit = 50) => api.get(`/admin/users?page=${page}&limit=${limit}`),
  
  createUser: (userData) => api.post('/admin/users', userData),
  
  updateUser: (id, userData) => api.patch(`/admin/users/${id}`, userData),
  
  deleteUser: (id) => api.delete(`/admin/users/${id}`),

  /**
   * Driver Management
   */
  getDrivers: (page = 1, limit = 50) => api.get(`/admin/drivers?page=${page}&limit=${limit}`),
  updateDriverStatus: (id, data) => api.patch(`/admin/drivers/${id}`, data),
  updateDriverPassword: (id, password) => api.patch(`/admin/drivers/update-password/${id}`, { password }),
  deleteDriver: (id) => api.delete(`/admin/drivers/${id}`),

  /**
   * Subscription Management
   */
  getSubscriptionPlans: () => api.get('/admin/driver-subscriptions/plans/list'),
  createSubscriptionPlan: (planData) => api.post('/admin/driver-subscriptions/plans/create', planData),
  
  /**
   * Common / Configuration Data
   */
  getServiceLocations: () => api.get('/admin/service-locations'),
  getRideModules: () => api.get('/common/ride_modules'),
  getVehicleTypes: (locationId, transportType) => api.get(`/types/${locationId}?transport_type=${transportType}`),

  /**
   * Owner Management
   */
  getOwners: () => api.get('/admin/owner-management/manage-owners'),
  createOwner: (ownerData) => api.post('/admin/owner-management/manage-owners', ownerData),
  updateOwner: (id, ownerData) => api.patch(`/admin/owner-management/manage-owners/${id}`, ownerData),
  deleteOwner: (id) => api.delete(`/admin/owner-management/manage-owners/${id}`),
  approveOwner: (id, data) => api.patch(`/admin/owner-management/manage-owners/${id}/approve`, data),

  /**
   * Reports Management
   * PRO-TIP: We use window.open for downloads to handle the stream directly or axios with responseType: 'blob'
   */
  downloadUserReport: (params) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/admin/reports/user/download?${query}`, { responseType: 'blob' });
  },
  downloadDriverReport: (params) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/admin/reports/driver/download?${query}`, { responseType: 'blob' });
  },
  downloadDriverDutyReport: (params) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/admin/reports/driver-duty/download?${query}`, { responseType: 'blob' });
  },
  downloadOwnerReport: (params) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/admin/reports/owner/download?${query}`, { responseType: 'blob' });
  },
  downloadFinanceReport: (params) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/admin/reports/finance/download?${query}`, { responseType: 'blob' });
  },
  downloadFleetFinanceReport: (params) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/admin/reports/fleet-finance/download?${query}`, { responseType: 'blob' });
  },
  getReportOptions: () => api.get('/admin/reports/options'),

  /**
   * Dashboard Stats & Data (New Parity Routes)
   */
  getDashboardPage: () => api.get('/admin/dashboard/page'),
  getDashboardData: () => api.get('/admin/dashboard/data'),
  getTodayEarnings: () => api.get('/admin/dashboard/today-earnings'),
  getOverallEarnings: () => api.get('/admin/dashboard/overall-earnings'),
  getCancelChart: () => api.get('/admin/dashboard/cancel-chart'),

  /**
   * Wallet & Financials
   */
  getUserWallets: () => api.get('/admin/wallet/users'),
  getDriverWallets: () => api.get('/admin/wallet/drivers'),
  getWithdrawalRequests: () => api.get('/admin/wallet/withdrawals'),
  updateWithdrawalStatus: (id, status) => api.patch(`/admin/wallet/withdrawals/${id}`, { status }),

  /**
   * Notifications & Banners
   */
  getNotifications: () => api.get('/admin/notifications'),
  sendNotification: (data) => api.post('/admin/notifications/send', data),
  getBanners: () => api.get('/admin/banners'),

  /**
   * Geofencing & Zone Management
   */
  getZones: () => api.get('/admin/zones'),
  createZone: (zoneData) => api.post('/admin/zones', zoneData),
  updateZone: (id, zoneData) => api.patch(`/admin/zones/${id}`, zoneData),
  deleteZone: (id) => api.delete(`/admin/zones/${id}`),
  toggleZoneStatus: (id) => api.patch(`/admin/zones/${id}/toggle-status`),

  /**
   * Languages Management (Master)
   */
  getLanguages: (params) => api.get('/admin/languages', { params }),
  createLanguage: (data) => api.post('/admin/languages', data),
  getLanguage: (id) => api.get(`/admin/languages/${id}`),
  updateLanguage: (id, data) => api.patch(`/admin/languages/${id}`, data),
  updateLanguageStatus: (id, data) => api.patch(`/admin/languages/${id}/status`, data),
  deleteLanguage: (id) => api.delete(`/admin/languages/${id}`),

  /**
   * Preferences Management (Master)
   */
  getPreferences: (params) => api.get('/admin/preferences', { params: params }),
  createPreference: (formData) => api.post('/admin/preferences', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getPreference: (id) => api.get(`/admin/preferences/${id}`),
  updatePreference: (id, formData) => api.patch(`/admin/preferences/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updatePreferenceStatus: (id, data) => api.patch(`/admin/preferences/${id}/status`, data),
  deletePreference: (id) => api.delete(`/admin/preferences/${id}`),

  /**
   * Roles & Permissions Management
   */
  getRoles: (params) => api.get('/admin/roles', { params }),
  createRole: (roleData) => api.post('/admin/roles', roleData),
  getRole: (id) => api.get(`/admin/roles/${id}`),
  updateRole: (id, roleData) => api.patch(`/admin/roles/${id}`, roleData),
  deleteRole: (id) => api.delete(`/admin/roles/${id}`),
  getRolePermissions: (id) => api.get(`/admin/roles/${id}/permissions`),
  updateRolePermissions: (id, data) => api.put(`/roles/${id}/permissions`, data),

  getPermissions: (params) => api.get('/admin/permissions', { params }),
  createPermission: (data) => api.post('/admin/permissions', data),
  getPermission: (id) => api.get(`/admin/permissions/${id}`),
  updatePermission: (id, data) => api.patch(`/admin/permissions/${id}`, data),
  deletePermission: (id) => api.delete(`/admin/permissions/${id}`),

  /**
   * App Modules Management
   */
  getAppModules: (params) => api.get('/admin/common/app-modules', { params }),
  createAppModule: (formData) => api.post('/admin/common/app-modules', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateAppModule: (id, formData) => api.patch(`/admin/common/app-modules/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteAppModule: (id) => api.delete(`/admin/common/app-modules/${id}`),

  /**
   * Notification Channels Management
   */
  getNotificationChannels: (params) => api.get('/admin/notification-channels', { params }),
  updateNotificationChannel: (id, data) => api.patch(`/admin/notification-channels/${id}`, data),
  toggleChannelPush: (id, active) => api.patch(`/admin/notification-channels/${id}/push`, { push_notification: active ? 1 : 0 }),
  toggleChannelMail: (id, active) => api.patch(`/admin/notification-channels/${id}/mail`, { mail: active ? 1 : 0 }),

  /**
   * Integration Settings
   */
  getPaymentGateways: (params) => api.get('/admin/integration-settings/payment-gateways', { params }),
  updatePaymentGateway: (id, data) => api.patch(`/admin/integration-settings/payment-gateways/${id}`, data),
  getPaymentSettings: () => api.get('/admin/integration-settings/payment-settings'),
  updatePaymentSettings: (data) => api.patch('/admin/integration-settings/payment-settings', data),
  getSMSSettings: () => api.get('/admin/integration-settings/sms'),
  updateSMSSettings: (data) => api.patch('/admin/integration-settings/sms', data),
  getFirebaseSettings: () => api.get('/admin/integration-settings/firebase'),
  updateFirebaseSettings: (data) => api.patch('/admin/integration-settings/firebase', data),
  getMapSettings: () => api.get('/admin/integration-settings/map'),
  updateMapSettings: (data) => api.patch('/admin/integration-settings/map', data),
  getMailSettings: () => api.get('/admin/integration-settings/mail'),
  updateMailSettings: (data) => api.patch('/admin/integration-settings/mail', data),

  /**
   * Onboarding Screens Management
   * Note: Backend currently only supports public GET (DB/seed only)
   */
  getOnboardingScreens: (role = 'user') => {
    // role: 'user' | 'driver' | 'owner'
    const path = role === 'user' ? '/on-boarding' : `/on-boarding-${role}`;
    return api.get(path);
  },
  createOnboardingScreen: (formData) => api.post('/on-boarding', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  updateOnboardingScreen: (id, formData) => api.patch(`/on-boarding/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  deleteOnboardingScreen: (id) => api.delete(`/on-boarding/${id}`),
};
