import { Router } from 'express';
import {
  approveOwner,
  createAppModule,
  createOwner,
  createPreference,
  createRole,
  createServiceLocation,
  createSubscriptionPlan,
  createUser,
  createZone,
  deleteAppModule,
  deleteDriver,
  deleteLanguage,
  deleteOwner,
  deletePreference,
  deleteRole,
  deleteServiceLocation,
  deleteUser,
  deleteZone,
  downloadDriverDutyReport,
  downloadDriverReport,
  downloadFinanceReport,
  downloadFleetFinanceReport,
  downloadOwnerReport,
  downloadUserReport,
  getAdminStatus,
  getAppModules,
  getCancelChart,
  getCountries,
  getDashboardData,
  getDriverOnboarding,
  getDrivers,
  getFirebaseSettings,
  getLanguages,
  getMailSettings,
  getMapSettings,
  getNotificationChannels,
  getOverallEarnings,
  getOwners,
  getOwnerOnboarding,
  getPaymentGateways,
  getPaymentSettings,
  getPreferences,
  getRideModules,
  getRoles,
  getServiceLocations,
  getSmsSettings,
  getSubscriptionPlans,
  getTodayEarnings,
  getUserOnboarding,
  getUsers,
  getVehicleTypes,
  getWithdrawals,
  getZones,
  loginAdmin,
  toggleChannelMail,
  toggleChannelPush,
  toggleZoneStatus,
  updateAppModule,
  updateDriver,
  updateDriverPassword,
  updateFirebaseSettings,
  updateLanguageStatus,
  updateMailSettings,
  updateMapSettings,
  updateOwner,
  updatePaymentSettings,
  updatePreferenceStatus,
  updateServiceLocation,
  updateSmsSettings,
  updateUser,
  updateZone,
} from '../controllers/adminController.js';

export const adminRouter = Router();

adminRouter.get('/admin', getAdminStatus);
adminRouter.get('/admin/status', getAdminStatus);
adminRouter.post('/admin/login', loginAdmin);

adminRouter.get('/admin/users', getUsers);
adminRouter.post('/admin/users', createUser);
adminRouter.patch('/admin/users/:id', updateUser);
adminRouter.delete('/admin/users/:id', deleteUser);

adminRouter.get('/admin/drivers', getDrivers);
adminRouter.patch('/admin/drivers/:id', updateDriver);
adminRouter.patch('/admin/drivers/update-password/:id', updateDriverPassword);
adminRouter.delete('/admin/drivers/:id', deleteDriver);

adminRouter.get('/admin/driver-subscriptions/plans/list', getSubscriptionPlans);
adminRouter.post('/admin/driver-subscriptions/plans/create', createSubscriptionPlan);

adminRouter.get('/countries', getCountries);
adminRouter.get('/admin/service-locations', getServiceLocations);
adminRouter.post('/admin/service-locations', createServiceLocation);
adminRouter.patch('/admin/service-locations/:id', updateServiceLocation);
adminRouter.delete('/admin/service-locations/:id', deleteServiceLocation);
adminRouter.get('/common/ride_modules', getRideModules);
adminRouter.get('/types/:locationId', getVehicleTypes);

adminRouter.get('/admin/owner-management/manage-owners', getOwners);
adminRouter.post('/admin/owner-management/manage-owners', createOwner);
adminRouter.patch('/admin/owner-management/manage-owners/:id', updateOwner);
adminRouter.patch('/admin/owner-management/manage-owners/:id/approve', approveOwner);
adminRouter.delete('/admin/owner-management/manage-owners/:id', deleteOwner);

adminRouter.get('/admin/dashboard/data', getDashboardData);
adminRouter.get('/admin/dashboard/overall-earnings', getOverallEarnings);
adminRouter.get('/admin/dashboard/today-earnings', getTodayEarnings);
adminRouter.get('/admin/dashboard/cancel-chart', getCancelChart);

adminRouter.get('/admin/wallet/withdrawals', getWithdrawals);

adminRouter.get('/admin/zones', getZones);
adminRouter.post('/admin/zones', createZone);
adminRouter.patch('/admin/zones/:id', updateZone);
adminRouter.delete('/admin/zones/:id', deleteZone);
adminRouter.patch('/admin/zones/:id/toggle-status', toggleZoneStatus);

adminRouter.get('/admin/languages', getLanguages);
adminRouter.patch('/admin/languages/:id/status', updateLanguageStatus);
adminRouter.delete('/admin/languages/:id', deleteLanguage);

adminRouter.get('/admin/preferences', getPreferences);
adminRouter.post('/admin/preferences', createPreference);
adminRouter.patch('/admin/preferences/:id/status', updatePreferenceStatus);
adminRouter.delete('/admin/preferences/:id', deletePreference);

adminRouter.get('/admin/roles', getRoles);
adminRouter.post('/admin/roles', createRole);
adminRouter.delete('/admin/roles/:id', deleteRole);

adminRouter.get('/admin/common/app-modules', getAppModules);
adminRouter.post('/admin/common/app-modules', createAppModule);
adminRouter.patch('/admin/common/app-modules/:id', updateAppModule);
adminRouter.delete('/admin/common/app-modules/:id', deleteAppModule);

adminRouter.get('/admin/notification-channels', getNotificationChannels);
adminRouter.patch('/admin/notification-channels/:id/push', toggleChannelPush);
adminRouter.patch('/admin/notification-channels/:id/mail', toggleChannelMail);

adminRouter.get('/admin/integration-settings/payment-gateways', getPaymentGateways);
adminRouter.get('/admin/integration-settings/payment-settings', getPaymentSettings);
adminRouter.patch('/admin/integration-settings/payment-settings', updatePaymentSettings);
adminRouter.get('/admin/integration-settings/sms', getSmsSettings);
adminRouter.patch('/admin/integration-settings/sms', updateSmsSettings);
adminRouter.get('/admin/integration-settings/firebase', getFirebaseSettings);
adminRouter.patch('/admin/integration-settings/firebase', updateFirebaseSettings);
adminRouter.get('/admin/integration-settings/map', getMapSettings);
adminRouter.patch('/admin/integration-settings/map', updateMapSettings);
adminRouter.get('/admin/integration-settings/mail', getMailSettings);
adminRouter.patch('/admin/integration-settings/mail', updateMailSettings);

adminRouter.get('/on-boarding', getUserOnboarding);
adminRouter.get('/on-boarding-driver', getDriverOnboarding);
adminRouter.get('/on-boarding-owner', getOwnerOnboarding);

adminRouter.get('/admin/reports/user/download', downloadUserReport);
adminRouter.get('/admin/reports/driver/download', downloadDriverReport);
adminRouter.get('/admin/reports/driver-duty/download', downloadDriverDutyReport);
adminRouter.get('/admin/reports/owner/download', downloadOwnerReport);
adminRouter.get('/admin/reports/finance/download', downloadFinanceReport);
adminRouter.get('/admin/reports/fleet-finance/download', downloadFleetFinanceReport);
