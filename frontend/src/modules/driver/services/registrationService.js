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

export const saveDriverPersonalDetails = (payload) => api.patch('/drivers/onboarding/personal', payload);

export const saveDriverReferral = (payload) => api.patch('/drivers/onboarding/referral', payload);

export const saveDriverVehicle = (payload) => api.patch('/drivers/onboarding/vehicle', payload);

export const saveDriverDocuments = (payload) => api.patch('/drivers/onboarding/documents', payload);

export const completeDriverOnboarding = (payload) => api.post('/drivers/onboarding/complete', payload);

export const getDriverRegistrationSession = ({ registrationId, phone }) =>
  api.get(`/drivers/onboarding/session/${registrationId}`, {
    params: { phone },
  });
