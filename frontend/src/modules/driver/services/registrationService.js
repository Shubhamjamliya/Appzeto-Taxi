import api from '../../../shared/api/axiosInstance';

const STORAGE_KEY = 'driverRegistrationSession';

const readStoredSession = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
};

export const getStoredDriverRegistrationSession = () => readStoredSession();

export const saveDriverRegistrationSession = (session = {}) => {
  const nextSession = {
    ...readStoredSession(),
    ...session,
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextSession));
  return nextSession;
};

export const clearDriverRegistrationSession = () => {
  localStorage.removeItem(STORAGE_KEY);
};

export const sendDriverOtp = (payload) => api.post('/drivers/onboarding/send-otp', payload);

export const verifyDriverOtp = (payload) => api.post('/drivers/onboarding/verify-otp', payload);

export const sendDriverLoginOtp = (payload) => api.post('/drivers/auth/send-otp', payload);

export const verifyDriverLoginOtp = (payload) => api.post('/drivers/auth/verify-otp', payload);

export const saveDriverPersonalDetails = (payload) => api.patch('/drivers/onboarding/personal', payload);

export const saveDriverReferral = (payload) => api.patch('/drivers/onboarding/referral', payload);

export const saveDriverVehicle = (payload) => api.patch('/drivers/onboarding/vehicle', payload);

export const saveDriverDocuments = (payload) => api.patch('/drivers/onboarding/documents', payload);

export const completeDriverOnboarding = (payload) => api.post('/drivers/onboarding/complete', payload);

const readLocalDriverToken = () =>
  localStorage.getItem('driverToken') || localStorage.getItem('token') || '';

export const getLocalDriverToken = readLocalDriverToken;

const withDriverAuth = (config = {}) => {
  const token = readLocalDriverToken();

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

export const getCurrentDriver = () => api.get('/drivers/me', withDriverAuth());

export const updateDriverVehicle = (payload) =>
  api.patch('/drivers/vehicle', payload, withDriverAuth());

export const getDriverVehicleTypes = () => api.get('/admin/types/vehicle-types', withDriverAuth());

export const getDriverApprovalStatus = () => {
  return api.get('/drivers/approval-status', withDriverAuth({
    params: {
      t: Date.now(),
    },
  }));
};

export const getDriverRegistrationSession = ({ registrationId, phone }) =>
  api.get(`/drivers/onboarding/session/${registrationId}`, {
    params: { phone },
  });

export const getDriverServiceLocations = () => api.get('/drivers/service-locations');
export const getDriverDocumentTemplates = () => api.get('/drivers/document-templates');
