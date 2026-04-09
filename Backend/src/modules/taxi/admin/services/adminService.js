import mongoose from 'mongoose';
import { ApiError } from '../../../../utils/ApiError.js';
import { createDefaultAdminState } from '../data/defaultAdminState.js';
import { AdminPanelState } from '../models/AdminPanelState.js';

const buildPaginator = (items, page = 1, limit = 50) => {
  const safePage = Number(page) || 1;
  const safeLimit = Number(limit) || 50;
  const start = (safePage - 1) * safeLimit;
  const results = items.slice(start, start + safeLimit);

  return {
    results,
    paginator: {
      current_page: safePage,
      per_page: safeLimit,
      total: items.length,
      last_page: Math.max(1, Math.ceil(items.length / safeLimit)),
    },
  };
};

const nextId = () => new mongoose.Types.ObjectId().toString();

const normalizeBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (value === 1 || value === '1' || value === 'true') return true;
  return false;
};

const findById = (items, id) => items.find((item) => String(item._id) === String(id));

const removeById = (items, id) => items.filter((item) => String(item._id) !== String(id));

const csvFromRows = (headers, rows) => {
  const escape = (value) => `"${String(value ?? '').replaceAll('"', '""')}"`;
  return [headers.join(','), ...rows.map((row) => headers.map((header) => escape(row[header])).join(','))].join('\n');
};

const syncSettingRows = (rows, payload) =>
  rows.map((row) => {
    if (!(row.key in payload)) return row;
    const nextValue = String(payload[row.key]);
    return {
      ...row,
      value: nextValue,
      is_active: row.key.startsWith('enable_') ? nextValue === '1' : row.is_active,
    };
  });

export const ensureAdminState = async () => {
  let state = await AdminPanelState.findOne({ scope: 'default' });

  if (!state) {
    state = await AdminPanelState.create(createDefaultAdminState());
  }

  return state;
};

export const getAdminModuleInfo = async () => {
  const state = await ensureAdminState();
  return {
    module: 'admin',
    ready: true,
    message: 'Admin module is wired and seeded',
    snapshot: {
      users: state.users.length,
      drivers: state.drivers.length,
      owners: state.owners.length,
      zones: state.zones.length,
    },
  };
};

export const loginAdmin = async ({ email, password }) => {
  const state = await ensureAdminState();
  const admin = state.admins.find(
    (item) => item.email?.toLowerCase() === email?.trim().toLowerCase() && item.password === password,
  );

  if (!admin) {
    throw new ApiError(401, 'Invalid admin credentials');
  }

  return {
    token: `admin-session-${admin._id}`,
    admin: {
      id: admin._id,
      name: admin.name,
      email: admin.email,
      role: admin.role,
    },
  };
};

export const listUsers = async ({ page = 1, limit = 50 }) => {
  const state = await ensureAdminState();
  return buildPaginator(state.users, page, limit);
};

export const createUser = async (payload) => {
  const state = await ensureAdminState();
  const user = {
    _id: nextId(),
    name: payload.name || 'New User',
    email: payload.email || '',
    mobile: payload.phone || payload.mobile || '',
    wallet_balance: Number(payload.wallet_balance || 0),
    active: payload.active ?? true,
    createdAt: new Date(),
  };

  state.users.unshift(user);
  await state.save();
  return user;
};

export const updateUser = async (id, payload) => {
  const state = await ensureAdminState();
  const user = findById(state.users, id);
  if (!user) throw new ApiError(404, 'User not found');
  Object.assign(user, payload);
  await state.save();
  return user;
};

export const deleteUser = async (id) => {
  const state = await ensureAdminState();
  state.users = removeById(state.users, id);
  await state.save();
  return true;
};

export const listDrivers = async ({ page = 1, limit = 50 }) => {
  const state = await ensureAdminState();
  return buildPaginator(state.drivers, page, limit);
};

export const updateDriver = async (id, payload) => {
  const state = await ensureAdminState();
  const driver = findById(state.drivers, id);
  if (!driver) throw new ApiError(404, 'Driver not found');
  Object.assign(driver, payload);
  await state.save();
  return driver;
};

export const updateDriverPassword = async (id, password) => {
  if (!password || String(password).length < 4) {
    throw new ApiError(400, 'Password must be at least 4 characters');
  }
  return updateDriver(id, { password_last_updated_at: new Date() });
};

export const deleteDriver = async (id) => {
  const state = await ensureAdminState();
  state.drivers = removeById(state.drivers, id);
  await state.save();
  return true;
};

export const listSubscriptionPlans = async () => (await ensureAdminState()).subscriptionPlans;

export const createSubscriptionPlan = async (payload) => {
  const state = await ensureAdminState();
  const plan = {
    _id: nextId(),
    ...payload,
    amount: Number(payload.amount || 0),
    duration: Number(payload.duration || 0),
    active: true,
  };
  state.subscriptionPlans.unshift(plan);
  await state.save();
  return plan;
};

export const listServiceLocations = async () => (await ensureAdminState()).serviceLocations;

export const listRideModules = async () => (await ensureAdminState()).rideModules;

export const listVehicleTypes = async (locationId, transportType) => {
  const state = await ensureAdminState();
  return state.vehicleTypes.filter((item) => {
    const sameLocation = !locationId || String(item.location_id) === String(locationId);
    const sameTransport = !transportType || item.transport_type === transportType;
    return sameLocation && sameTransport;
  });
};

export const listOwners = async () => (await ensureAdminState()).owners;

export const createOwner = async (payload) => {
  const state = await ensureAdminState();
  const owner = {
    _id: nextId(),
    company_name: payload.company_name,
    name: payload.name,
    mobile: payload.mobile,
    email: payload.email,
    service_location_id: payload.service_location_id,
    transport_type: payload.transport_type,
    active: true,
    approve: false,
    createdAt: new Date(),
  };
  state.owners.unshift(owner);
  await state.save();
  return owner;
};

export const updateOwner = async (id, payload) => {
  const state = await ensureAdminState();
  const owner = findById(state.owners, id);
  if (!owner) throw new ApiError(404, 'Owner not found');
  Object.assign(owner, payload);
  await state.save();
  return owner;
};

export const approveOwner = async (id, payload) =>
  updateOwner(id, { approve: normalizeBoolean(payload.approve), active: true });

export const deleteOwner = async (id) => {
  const state = await ensureAdminState();
  state.owners = removeById(state.owners, id);
  await state.save();
  return true;
};

export const getDashboardData = async () => (await ensureAdminState()).dashboard;

export const getOverallEarnings = async () => (await ensureAdminState()).dashboard.overallEarnings;

export const getTodayEarnings = async () => (await ensureAdminState()).dashboard.todayEarnings;

export const getCancelChart = async () => (await ensureAdminState()).dashboard.cancelChart;

export const listWithdrawals = async () => (await ensureAdminState()).withdrawals;

export const listZones = async () => (await ensureAdminState()).zones;

export const createZone = async (payload) => {
  const state = await ensureAdminState();
  const zone = {
    _id: nextId(),
    ...payload,
    name: payload.name,
    active: payload.status ? payload.status === 'active' : true,
  };
  state.zones.unshift(zone);
  await state.save();
  return zone;
};

export const updateZone = async (id, payload) => {
  const state = await ensureAdminState();
  const zone = findById(state.zones, id);
  if (!zone) throw new ApiError(404, 'Zone not found');
  Object.assign(zone, payload, {
    active: payload.status ? payload.status === 'active' : zone.active,
  });
  await state.save();
  return zone;
};

export const deleteZone = async (id) => {
  const state = await ensureAdminState();
  state.zones = removeById(state.zones, id);
  await state.save();
  return true;
};

export const toggleZoneStatus = async (id) => {
  const state = await ensureAdminState();
  const zone = findById(state.zones, id);
  if (!zone) throw new ApiError(404, 'Zone not found');
  zone.active = !zone.active;
  zone.status = zone.active ? 'active' : 'inactive';
  await state.save();
  return zone;
};

export const listLanguages = async () => (await ensureAdminState()).languages;

export const updateLanguageStatus = async (id, payload) => {
  const state = await ensureAdminState();
  const language = findById(state.languages, id);
  if (!language) throw new ApiError(404, 'Language not found');
  language.active = Number(payload.active ?? language.active);
  await state.save();
  return language;
};

export const deleteLanguage = async (id) => {
  const state = await ensureAdminState();
  state.languages = removeById(state.languages, id);
  await state.save();
  return true;
};

export const listPreferences = async () => (await ensureAdminState()).preferences;

export const createPreference = async (payload) => {
  const state = await ensureAdminState();
  const firstLetter = (payload.name || 'P').trim().charAt(0).toUpperCase() || 'P';
  const preference = {
    _id: nextId(),
    name: payload.name,
    icon:
      payload.icon ||
      `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="64" height="64"><rect rx="16" width="64" height="64" fill="%23E0E7FF"/><text x="50%" y="54%" dominant-baseline="middle" text-anchor="middle" font-size="28">${firstLetter}</text></svg>`,
    active: 1,
  };
  state.preferences.unshift(preference);
  await state.save();
  return preference;
};

export const updatePreferenceStatus = async (id, payload) => {
  const state = await ensureAdminState();
  const preference = findById(state.preferences, id);
  if (!preference) throw new ApiError(404, 'Preference not found');
  preference.active = Number(payload.active ?? preference.active);
  await state.save();
  return preference;
};

export const deletePreference = async (id) => {
  const state = await ensureAdminState();
  state.preferences = removeById(state.preferences, id);
  await state.save();
  return true;
};

export const listRoles = async () => (await ensureAdminState()).roles;

export const createRole = async (payload) => {
  const state = await ensureAdminState();
  const role = {
    _id: nextId(),
    name: payload.name,
    description: payload.description || '',
    slug: payload.name?.trim().toLowerCase().replace(/\s+/g, '-') || `role-${Date.now()}`,
  };
  state.roles.unshift(role);
  await state.save();
  return role;
};

export const deleteRole = async (id) => {
  const state = await ensureAdminState();
  state.roles = removeById(state.roles, id);
  await state.save();
  return true;
};

export const listAppModules = async ({ page = 1, limit = 20 }) => {
  const state = await ensureAdminState();
  const items = [...state.appModules].sort((a, b) => Number(a.order_by || 0) - Number(b.order_by || 0));
  return buildPaginator(items, page, limit);
};

export const createAppModule = async (payload) => {
  const state = await ensureAdminState();
  const moduleItem = {
    _id: nextId(),
    name: payload.name,
    transport_type: payload.transport_type,
    service_type: payload.service_type,
    order_by: Number(payload.order_by || 0),
    short_description: payload.short_description || '',
    description: payload.description || '',
    active: normalizeBoolean(payload.active ?? true),
    mobile_menu_icon:
      payload.mobile_menu_icon ||
      (payload.transport_type === 'delivery'
        ? 'https://cdn.jsdelivr.net/gh/tabler/tabler-icons/icons/package.svg'
        : 'https://cdn.jsdelivr.net/gh/tabler/tabler-icons/icons/car.svg'),
  };
  state.appModules.unshift(moduleItem);
  await state.save();
  return moduleItem;
};

export const updateAppModule = async (id, payload) => {
  const state = await ensureAdminState();
  const moduleItem = findById(state.appModules, id);
  if (!moduleItem) throw new ApiError(404, 'App module not found');
  Object.assign(moduleItem, payload, {
    order_by: payload.order_by !== undefined ? Number(payload.order_by) : moduleItem.order_by,
    active: payload.active !== undefined ? normalizeBoolean(payload.active) : moduleItem.active,
  });
  await state.save();
  return moduleItem;
};

export const deleteAppModule = async (id) => {
  const state = await ensureAdminState();
  state.appModules = removeById(state.appModules, id);
  await state.save();
  return true;
};

export const listNotificationChannels = async () => (await ensureAdminState()).notificationChannels;

export const updateNotificationChannelField = async (id, field, value) => {
  const state = await ensureAdminState();
  const channel = findById(state.notificationChannels, id);
  if (!channel) throw new ApiError(404, 'Notification channel not found');
  channel[field] = normalizeBoolean(value);
  await state.save();
  return channel;
};

export const listPaymentGateways = async () => (await ensureAdminState()).paymentGateways;

export const getPaymentSettings = async () => (await ensureAdminState()).paymentSettings;

export const updatePaymentSettings = async (payload) => {
  const state = await ensureAdminState();
  state.paymentSettings = syncSettingRows(state.paymentSettings, payload);
  await state.save();
  return state.paymentSettings;
};

export const getSmsSettings = async () => (await ensureAdminState()).smsSettings;

export const updateSmsSettings = async (payload) => {
  const state = await ensureAdminState();
  state.smsSettings = syncSettingRows(state.smsSettings, payload);
  await state.save();
  return state.smsSettings;
};

export const getFirebaseSettings = async () => (await ensureAdminState()).firebaseSettings;

export const updateFirebaseSettings = async (payload) => {
  const state = await ensureAdminState();
  state.firebaseSettings = {
    ...state.firebaseSettings,
    ...payload,
    firebase_json_name: payload.firebase_json_name || state.firebaseSettings.firebase_json_name,
  };
  await state.save();
  return state.firebaseSettings;
};

export const getMapSettings = async () => (await ensureAdminState()).mapSettings;

export const updateMapSettings = async (payload) => {
  const state = await ensureAdminState();
  state.mapSettings = { ...state.mapSettings, ...payload };
  await state.save();
  return state.mapSettings;
};

export const getMailSettings = async () => (await ensureAdminState()).mailSettings;

export const updateMailSettings = async (payload) => {
  const state = await ensureAdminState();
  state.mailSettings = { ...state.mailSettings, ...payload };
  await state.save();
  return state.mailSettings;
};

export const listOnboardingScreens = async (audience) => {
  const state = await ensureAdminState();
  return state.onboardingScreens.filter((screen) => screen.audience === audience || screen.screen === audience);
};

export const buildUserReport = async () => {
  const state = await ensureAdminState();
  return csvFromRows(
    ['name', 'email', 'mobile', 'active'],
    state.users.map((item) => ({ name: item.name, email: item.email, mobile: item.mobile, active: item.active })),
  );
};

export const buildDriverReport = async () => {
  const state = await ensureAdminState();
  return csvFromRows(
    ['name', 'mobile', 'city', 'status'],
    state.drivers.map((item) => ({ name: item.name, mobile: item.mobile, city: item.city, status: item.status })),
  );
};

export const buildDriverDutyReport = async () => {
  const state = await ensureAdminState();
  return csvFromRows(
    ['driver', 'city', 'status', 'rating'],
    state.drivers.map((item) => ({ driver: item.name, city: item.city, status: item.status, rating: item.rating })),
  );
};

export const buildOwnerReport = async () => {
  const state = await ensureAdminState();
  return csvFromRows(
    ['company_name', 'name', 'email', 'transport_type', 'active'],
    state.owners.map((item) => ({
      company_name: item.company_name,
      name: item.name,
      email: item.email,
      transport_type: item.transport_type,
      active: item.active,
    })),
  );
};

export const buildFinanceReport = async () => {
  const state = await ensureAdminState();
  return csvFromRows(
    ['transactionId', 'driver', 'amount', 'payment_method', 'status'],
    state.withdrawals.map((item) => ({
      transactionId: item.transactionId,
      driver: item.driver_id?.name,
      amount: item.amount,
      payment_method: item.payment_method,
      status: item.status,
    })),
  );
};

export const buildFleetFinanceReport = async () => {
  const state = await ensureAdminState();
  return csvFromRows(
    ['company_name', 'owner', 'transport_type', 'active'],
    state.owners.map((item) => ({
      company_name: item.company_name,
      owner: item.name,
      transport_type: item.transport_type,
      active: item.active,
    })),
  );
};
