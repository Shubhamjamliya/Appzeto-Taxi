import { asyncHandler } from "../../../../utils/asyncHandler.js";
import * as adminService from "../services/adminService.js";

const ok = (res, data, extra = {}) =>
  res.json({ success: true, data, ...extra });

const sendCsv = (res, filename, csv) => {
  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(csv);
};

export const getAdminStatus = asyncHandler(async (_req, res) =>
  ok(res, await adminService.getAdminModuleInfo()),
);
export const loginAdmin = asyncHandler(async (req, res) =>
  ok(res, await adminService.loginAdmin(req.body)),
);

export const getUsers = asyncHandler(async (req, res) =>
  ok(res, await adminService.listUsers(req.query)),
);
export const createUser = asyncHandler(async (req, res) =>
  ok(res, await adminService.createUser(req.body)),
);
export const updateUser = asyncHandler(async (req, res) =>
  ok(res, await adminService.updateUser(req.params.id, req.body)),
);
export const deleteUser = asyncHandler(async (req, res) => {
  await adminService.deleteUser(req.params.id);
  ok(res, { deleted: true });
});

export const getDrivers = asyncHandler(async (req, res) =>
  ok(res, await adminService.listDrivers(req.query)),
);
export const getDriver = asyncHandler(async (req, res) =>
  ok(res, await adminService.getDriverById(req.params.id)),
);
export const updateDriver = asyncHandler(async (req, res) =>
  ok(res, await adminService.updateDriver(req.params.id, req.body)),
);
export const updateDriverPassword = asyncHandler(async (req, res) =>
  ok(
    res,
    await adminService.updateDriverPassword(req.params.id, req.body.password),
  ),
);
export const deleteDriver = asyncHandler(async (req, res) => {
  await adminService.deleteDriver(req.params.id);
  ok(res, { deleted: true });
});

export const getSubscriptionPlans = asyncHandler(async (_req, res) =>
  ok(res, { results: await adminService.listSubscriptionPlans() }),
);
export const createSubscriptionPlan = asyncHandler(async (req, res) =>
  ok(res, await adminService.createSubscriptionPlan(req.body)),
);

export const getServiceLocations = asyncHandler(async (_req, res) =>
  ok(res, await adminService.listServiceLocations()),
);
export const getCountries = asyncHandler(async (_req, res) =>
  ok(res, { results: await adminService.listCountries() }),
);
export const createServiceLocation = asyncHandler(async (req, res) =>
  ok(res, await adminService.createServiceLocation(req.body)),
);
export const updateServiceLocation = asyncHandler(async (req, res) =>
  ok(res, await adminService.updateServiceLocation(req.params.id, req.body)),
);
export const deleteServiceLocation = asyncHandler(async (req, res) => {
  await adminService.deleteServiceLocation(req.params.id);
  ok(res, { deleted: true });
});
export const getNearbyServiceLocations = asyncHandler(async (req, res) =>
  ok(res, {
    results: await adminService.listNearbyServiceLocations(req.query),
  }),
);
export const getRideModules = asyncHandler(async (_req, res) =>
  ok(res, await adminService.listRideModules()),
);
export const getVehicleTypes = asyncHandler(async (req, res) =>
  ok(
    res,
    await adminService.listVehicleTypes(
      req.params.locationId,
      req.query.transport_type,
    ),
  ),
);
export const getVehicleTypeCatalog = asyncHandler(async (_req, res) =>
  ok(res, await adminService.listVehicleCatalog()),
);
export const getVehiclePreferenceOptions = asyncHandler(async (_req, res) =>
  ok(res, await adminService.listVehiclePreferences()),
);
export const createVehicleType = asyncHandler(async (req, res) =>
  ok(res, await adminService.createVehicleType(req.body)),
);
export const updateVehicleType = asyncHandler(async (req, res) =>
  ok(res, await adminService.updateVehicleType(req.params.id, req.body)),
);
export const deleteVehicleType = asyncHandler(async (req, res) => {
  await adminService.deleteVehicleType(req.params.id);
  ok(res, { deleted: true });
});

export const getOwners = asyncHandler(async (_req, res) =>
  ok(res, { results: await adminService.listOwners() }),
);
export const createOwner = asyncHandler(async (req, res) =>
  ok(res, await adminService.createOwner(req.body)),
);
export const updateOwner = asyncHandler(async (req, res) =>
  ok(res, await adminService.updateOwner(req.params.id, req.body)),
);
export const approveOwner = asyncHandler(async (req, res) =>
  ok(res, await adminService.approveOwner(req.params.id, req.body)),
);
export const deleteOwner = asyncHandler(async (req, res) => {
  await adminService.deleteOwner(req.params.id);
  ok(res, { deleted: true });
});

export const getOwnerBookings = asyncHandler(async (_req, res) =>
  ok(res, { results: await adminService.listOwnerBookings() }),
);
export const createOwnerBooking = asyncHandler(async (req, res) =>
  ok(res, await adminService.createOwnerBooking(req.body)),
);
export const updateOwnerBooking = asyncHandler(async (req, res) =>
  ok(res, await adminService.updateOwnerBooking(req.params.id, req.body)),
);
export const deleteOwnerBooking = asyncHandler(async (req, res) => {
  await adminService.deleteOwnerBooking(req.params.id);
  ok(res, { deleted: true });
});

export const getDashboardData = asyncHandler(async (_req, res) =>
  ok(res, await adminService.getDashboardData()),
);
export const getOverallEarnings = asyncHandler(async (_req, res) =>
  ok(res, await adminService.getOverallEarnings()),
);
export const getTodayEarnings = asyncHandler(async (_req, res) =>
  ok(res, await adminService.getTodayEarnings()),
);
export const getCancelChart = asyncHandler(async (_req, res) =>
  ok(res, await adminService.getCancelChart()),
);
export const getWithdrawals = asyncHandler(async (_req, res) =>
  ok(res, { results: await adminService.listWithdrawals() }),
);

export const getZones = asyncHandler(async (_req, res) =>
  ok(res, { results: await adminService.listZones() }),
);
export const createZone = asyncHandler(async (req, res) =>
  ok(res, await adminService.createZone(req.body)),
);
export const updateZone = asyncHandler(async (req, res) =>
  ok(res, await adminService.updateZone(req.params.id, req.body)),
);
export const deleteZone = asyncHandler(async (req, res) => {
  await adminService.deleteZone(req.params.id);
  ok(res, { deleted: true });
});
export const toggleZoneStatus = asyncHandler(async (req, res) =>
  ok(res, await adminService.toggleZoneStatus(req.params.id)),
);

export const getSetPrices = asyncHandler(async (_req, res) =>
  ok(res, { set_prices: await adminService.listSetPrices() }),
);
export const createSetPrice = asyncHandler(async (req, res) =>
  ok(res, await adminService.createSetPrice(req.body)),
);
export const updateSetPrice = asyncHandler(async (req, res) =>
  ok(res, await adminService.updateSetPrice(req.params.id, req.body)),
);
export const deleteSetPrice = asyncHandler(async (req, res) => {
  await adminService.deleteSetPrice(req.params.id);
  ok(res, { deleted: true });
});

export const getAirports = asyncHandler(async (_req, res) =>
  ok(res, { airports: await adminService.listAirports() }),
);
export const createAirport = asyncHandler(async (req, res) =>
  ok(res, await adminService.createAirport(req.body)),
);
export const updateAirport = asyncHandler(async (req, res) =>
  ok(res, await adminService.updateAirport(req.params.id, req.body)),
);
export const deleteAirport = asyncHandler(async (req, res) => {
  await adminService.deleteAirport(req.params.id);
  ok(res, { deleted: true });
});

export const getGoodsTypes = asyncHandler(async (_req, res) =>
  ok(res, { goods_types: await adminService.listGoodsTypes() }),
);
export const createGoodsType = asyncHandler(async (req, res) =>
  ok(res, await adminService.createGoodsType(req.body)),
);
export const updateGoodsType = asyncHandler(async (req, res) =>
  ok(res, await adminService.updateGoodsType(req.params.id, req.body)),
);
export const deleteGoodsType = asyncHandler(async (req, res) => {
  await adminService.deleteGoodsType(req.params.id);
  ok(res, { deleted: true });
});

export const getRentalPackageTypes = asyncHandler(async (_req, res) =>
  ok(res, { rental_packages: await adminService.listRentalPackageTypes() }),
);
export const createRentalPackageType = asyncHandler(async (req, res) =>
  ok(res, await adminService.createRentalPackageType(req.body)),
);
export const updateRentalPackageType = asyncHandler(async (req, res) =>
  ok(res, await adminService.updateRentalPackageType(req.params.id, req.body)),
);
export const deleteRentalPackageType = asyncHandler(async (req, res) => {
  await adminService.deleteRentalPackageType(req.params.id);
  ok(res, { deleted: true });
});

export const getOwnerNeededDocuments = asyncHandler(async (_req, res) =>
  ok(res, { results: await adminService.listOwnerNeededDocuments() }),
);
export const createOwnerNeededDocument = asyncHandler(async (req, res) =>
  ok(res, await adminService.createOwnerNeededDocument(req.body)),
);
export const updateOwnerNeededDocument = asyncHandler(async (req, res) =>
  ok(res, await adminService.updateOwnerNeededDocument(req.params.id, req.body)),
);
export const deleteOwnerNeededDocument = asyncHandler(async (req, res) => {
  await adminService.deleteOwnerNeededDocument(req.params.id);
  ok(res, { deleted: true });
});

export const getLanguages = asyncHandler(async (_req, res) => {
  const items = await adminService.listLanguages();
  res.json({ success: true, paginator: { data: items }, results: items });
});
export const updateLanguageStatus = asyncHandler(async (req, res) =>
  ok(res, await adminService.updateLanguageStatus(req.params.id, req.body)),
);
export const deleteLanguage = asyncHandler(async (req, res) => {
  await adminService.deleteLanguage(req.params.id);
  ok(res, { deleted: true });
});

export const getPreferences = asyncHandler(async (_req, res) => {
  const items = await adminService.listPreferences();
  res.json({ success: true, paginator: { data: items }, results: items });
});
export const createPreference = asyncHandler(async (req, res) =>
  ok(res, await adminService.createPreference(req.body)),
);
export const updatePreferenceStatus = asyncHandler(async (req, res) =>
  ok(res, await adminService.updatePreferenceStatus(req.params.id, req.body)),
);
export const deletePreference = asyncHandler(async (req, res) => {
  await adminService.deletePreference(req.params.id);
  ok(res, { deleted: true });
});

export const getRoles = asyncHandler(async (_req, res) =>
  ok(res, { results: await adminService.listRoles() }),
);
export const createRole = asyncHandler(async (req, res) =>
  ok(res, await adminService.createRole(req.body)),
);
export const deleteRole = asyncHandler(async (req, res) => {
  await adminService.deleteRole(req.params.id);
  ok(res, { deleted: true });
});

export const getAppModules = asyncHandler(async (req, res) =>
  ok(res, await adminService.listAppModules(req.query)),
);
export const createAppModule = asyncHandler(async (req, res) =>
  ok(res, await adminService.createAppModule(req.body)),
);
export const updateAppModule = asyncHandler(async (req, res) =>
  ok(res, await adminService.updateAppModule(req.params.id, req.body)),
);
export const deleteAppModule = asyncHandler(async (req, res) => {
  await adminService.deleteAppModule(req.params.id);
  ok(res, { deleted: true });
});

export const getNotificationChannels = asyncHandler(async (_req, res) =>
  ok(res, { results: await adminService.listNotificationChannels() }),
);
export const toggleChannelPush = asyncHandler(async (req, res) =>
  ok(
    res,
    await adminService.updateNotificationChannelField(
      req.params.id,
      "push_notification",
      req.body.push_notification,
    ),
  ),
);
export const toggleChannelMail = asyncHandler(async (req, res) =>
  ok(
    res,
    await adminService.updateNotificationChannelField(
      req.params.id,
      "mail",
      req.body.mail,
    ),
  ),
);

export const getPaymentGateways = asyncHandler(async (_req, res) =>
  ok(res, { results: await adminService.listPaymentGateways() }),
);
export const getPaymentSettings = asyncHandler(async (_req, res) =>
  ok(res, { rows: await adminService.getPaymentSettings() }),
);
export const updatePaymentSettings = asyncHandler(async (req, res) =>
  ok(res, { rows: await adminService.updatePaymentSettings(req.body) }),
);

export const getSmsSettings = asyncHandler(async (_req, res) =>
  ok(res, { rows: await adminService.getSmsSettings() }),
);
export const updateSmsSettings = asyncHandler(async (req, res) =>
  ok(res, { rows: await adminService.updateSmsSettings(req.body) }),
);

export const getFirebaseSettings = asyncHandler(async (_req, res) =>
  ok(res, { settings: await adminService.getFirebaseSettings() }),
);
export const updateFirebaseSettings = asyncHandler(async (req, res) =>
  ok(res, { settings: await adminService.updateFirebaseSettings(req.body) }),
);

export const getMapSettings = asyncHandler(async (_req, res) =>
  ok(res, { settings: await adminService.getMapSettings() }),
);
export const updateMapSettings = asyncHandler(async (req, res) =>
  ok(res, { settings: await adminService.updateMapSettings(req.body) }),
);

export const getMailSettings = asyncHandler(async (_req, res) =>
  ok(res, { settings: await adminService.getMailSettings() }),
);
export const updateMailSettings = asyncHandler(async (req, res) =>
  ok(res, { settings: await adminService.updateMailSettings(req.body) }),
);

export const getUserOnboarding = asyncHandler(async (_req, res) =>
  res.json({
    success: true,
    results: await adminService.listOnboardingScreens("user"),
  }),
);
export const getDriverOnboarding = asyncHandler(async (_req, res) =>
  res.json({
    success: true,
    results: await adminService.listOnboardingScreens("driver"),
  }),
);
export const getOwnerOnboarding = asyncHandler(async (_req, res) =>
  res.json({
    success: true,
    results: await adminService.listOnboardingScreens("owner"),
  }),
);

export const downloadUserReport = asyncHandler(async (_req, res) =>
  sendCsv(res, "user-report.csv", await adminService.buildUserReport()),
);
export const downloadDriverReport = asyncHandler(async (_req, res) =>
  sendCsv(res, "driver-report.csv", await adminService.buildDriverReport()),
);
export const downloadDriverDutyReport = asyncHandler(async (_req, res) =>
  sendCsv(
    res,
    "driver-duty-report.csv",
    await adminService.buildDriverDutyReport(),
  ),
);
export const downloadOwnerReport = asyncHandler(async (_req, res) =>
  sendCsv(res, "owner-report.csv", await adminService.buildOwnerReport()),
);
export const downloadFinanceReport = asyncHandler(async (_req, res) =>
  sendCsv(res, "finance-report.csv", await adminService.buildFinanceReport()),
);
export const downloadFleetFinanceReport = asyncHandler(async (_req, res) =>
  sendCsv(
    res,
    "fleet-finance-report.csv",
    await adminService.buildFleetFinanceReport(),
  ),
);
