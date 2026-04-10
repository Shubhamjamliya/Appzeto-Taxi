import mongoose from 'mongoose';
import { ApiError } from '../../../../utils/ApiError.js';
import { createDefaultAdminState } from '../data/defaultAdminState.js';
import { AdminPanelState } from '../models/AdminPanelState.js';
import { AdminBusinessSetting } from '../models/AdminBusinessSetting.js';
import { createDefaultBusinessSettings } from '../data/defaultBusinessSettings.js';
import { Owner } from '../models/Owner.js';
import { AdminThirdPartySetting } from '../models/AdminThirdPartySetting.js';
import { createDefaultThirdPartySettings } from '../data/defaultThirdPartySettings.js';
import { ServiceLocation } from '../models/ServiceLocation.js';
import { Vehicle } from '../models/Vehicle.js';
import { Driver } from '../../driver/models/Driver.js';
import { hashPassword } from '../../driver/services/authService.js';

const deepMerge = (target, source) => {
  const result = { ...target };
  for (const key in source) {
    if (source[key] instanceof Object && key in result && result[key] instanceof Object) {
      result[key] = deepMerge(result[key], source[key]);
    } else {
      result[key] = source[key];
    }
  }
  return result;
};

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
const toObjectId = (value) => new mongoose.Types.ObjectId(String(value));

const normalizeBoolean = (value) => {
  if (typeof value === 'boolean') return value;
  if (value === 1 || value === '1' || value === 'true') return true;
  return false;
};

const findById = (items, id) => items.find((item) => String(item._id) === String(id));

const removeById = (items, id) => items.filter((item) => String(item._id) !== String(id));

const serializeOwner = (owner) => ({
  _id: owner._id,
  company_name: owner.company_name || '',
  name: owner.name || '',
  mobile: owner.mobile || '',
  email: owner.email || '',
  service_location_id: owner.service_location_id?._id || owner.service_location_id || '',
  service_location: owner.service_location_id?.service_location_name || owner.service_location_id?.name || '',
  transport_type: owner.transport_type || '',
  active: owner.active !== false,
  approve: Boolean(owner.approve),
  status: owner.status || (owner.approve ? 'approved' : 'pending'),
  createdAt: owner.createdAt,
  updatedAt: owner.updatedAt,
});

const serializeDriver = (driver) => ({
  _id: driver._id,
  name: driver.name || '',
  phone: driver.phone || '',
  mobile: driver.phone || '',
  email: driver.email || '',
  city: driver.city || '',
  transport_type: driver.registerFor || driver.vehicleType || '',
  register_for: driver.registerFor || '',
  vehicle_type: driver.vehicleType || '',
  vehicle_number: driver.vehicleNumber || '',
  vehicle_color: driver.vehicleColor || '',
  rating: driver.rating || 0,
  approve: Boolean(driver.approve),
  status: driver.status || (driver.approve ? 'approved' : 'pending'),
  active: driver.approve !== false && String(driver.status || '').toLowerCase() !== 'inactive',
  documents: driver.documents || {},
  onboarding: driver.onboarding || {},
  createdAt: driver.createdAt,
  updatedAt: driver.updatedAt,
});

const DEFAULT_SERVICE_LOCATION_CENTER = { lat: 22.7196, lng: 75.8577 };

const normalizeServiceLocationPayload = (payload = {}, fallback = {}) => {
  const latitude = Number(payload.latitude ?? fallback.latitude ?? DEFAULT_SERVICE_LOCATION_CENTER.lat);
  const longitude = Number(payload.longitude ?? fallback.longitude ?? DEFAULT_SERVICE_LOCATION_CENTER.lng);
  const name = payload.name?.trim() || fallback.name || fallback.service_location_name;
  const currencyCode = String(payload.currency_code ?? fallback.currency_code ?? 'INR').toUpperCase();
  const status = payload.status ?? fallback.status ?? 'active';

  return {
    name,
    service_location_name: name,
    address: payload.address ?? fallback.address ?? '',
    country: payload.country ?? fallback.country ?? 'India',
    currency_name: payload.currency_name ?? fallback.currency_name ?? currencyCode,
    currency_symbol: payload.currency_symbol ?? fallback.currency_symbol ?? '₹',
    currency_code: currencyCode,
    currency_symbol: payload.currency_symbol ?? fallback.currency_symbol ?? '₹',
    timezone: payload.timezone ?? fallback.timezone ?? 'Asia/Kolkata',
    unit: payload.unit ?? fallback.unit ?? 'km',
    latitude,
    longitude,
    location: {
      type: 'Point',
      coordinates: [longitude, latitude],
    },
    status,
    active: status === 'active',
  };
};

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

  const hasLegacySeededZones =
    Array.isArray(state.zones) &&
    state.zones.length === 2 &&
    state.zones.every((zone) => ['Vijay Nagar Prime', 'Connaught Place Core'].includes(zone?.name));

  const hasLegacySeededServiceLocations =
    Array.isArray(state.serviceLocations) &&
    state.serviceLocations.length === 2 &&
    state.serviceLocations.every((location) => ['Indore', 'New Delhi'].includes(location?.name));

  if (hasLegacySeededZones || hasLegacySeededServiceLocations) {
    if (hasLegacySeededZones) {
      state.zones = [];
    }

    if (hasLegacySeededServiceLocations) {
      state.serviceLocations = [];
    }

    await state.save();
  }

  return state;
};

const ensureServiceLocationsSeeded = async () => {
  const existingCount = await ServiceLocation.countDocuments();
  if (existingCount > 0) {
    return;
  }
};

export const getAdminModuleInfo = async () => {
  const state = await ensureAdminState();
  const ownerCount = await Owner.countDocuments();
  return {
    module: 'admin',
    ready: true,
    message: 'Admin module is wired and seeded',
    snapshot: {
      users: state.users.length,
      drivers: state.drivers.length,
      owners: ownerCount,
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
  const safePage = Number(page) || 1;
  const safeLimit = Number(limit) || 50;
  const start = (safePage - 1) * safeLimit;

  const [drivers, total] = await Promise.all([
    Driver.find().sort({ createdAt: -1 }).skip(start).limit(safeLimit).lean(),
    Driver.countDocuments(),
  ]);

  return {
    results: drivers.map(serializeDriver),
    paginator: {
      current_page: safePage,
      per_page: safeLimit,
      total,
      last_page: Math.max(1, Math.ceil(total / safeLimit)),
    },
  };
};

export const updateDriver = async (id, payload) => {
  const update = {
    ...payload,
  };

  if ('approve' in payload) {
    update.approve = Boolean(payload.approve);
  }

  if (payload.status !== undefined) {
    update.status = String(payload.status);
  } else if ('approve' in payload) {
    update.status = update.approve ? 'approved' : 'pending';
  }

  if ('phone' in update) {
    update.phone = String(update.phone);
  }

  const driver = await Driver.findByIdAndUpdate(id, update, { new: true });
  if (!driver) throw new ApiError(404, 'Driver not found');
  return serializeDriver(driver);
};

export const updateDriverPassword = async (id, password) => {
  if (!password || String(password).length < 4) {
    throw new ApiError(400, 'Password must be at least 4 characters');
  }
  const driver = await Driver.findByIdAndUpdate(
    id,
    {
      password: await hashPassword(password),
      password_last_updated_at: new Date(),
    },
    { new: true },
  );

  if (!driver) throw new ApiError(404, 'Driver not found');
  return serializeDriver(driver);
};

export const deleteDriver = async (id) => {
  const deleted = await Driver.findByIdAndDelete(id);
  if (!deleted) {
    throw new ApiError(404, 'Driver not found');
  }
  return true;
};

export const getDriverById = async (id) => {
  const driver = await Driver.findById(id).lean();
  if (!driver) {
    throw new ApiError(404, 'Driver not found');
  }
  return serializeDriver(driver);
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

export const listServiceLocations = async () => {
  await ensureServiceLocationsSeeded();
  return ServiceLocation.find().sort({ createdAt: -1 }).lean();
};

export const listCountries = async () => {
  const locations = await listServiceLocations();
  const countriesFromLocations = locations
    .map((item) => item.country)
    .filter(Boolean)
    .map((country) =>
      typeof country === 'object'
        ? country
        : {
            _id: nextId(),
            name: String(country),
            code: String(country).slice(0, 2).toUpperCase(),
          },
    );

  const merged = [
    { _id: nextId(), name: 'India', code: 'IN' },
    { _id: nextId(), name: 'United Arab Emirates', code: 'AE' },
    { _id: nextId(), name: 'United Kingdom', code: 'GB' },
    { _id: nextId(), name: 'United States', code: 'US' },
    ...countriesFromLocations,
  ];

  return merged.filter(
    (country, index, list) =>
      list.findIndex((item) => item.name?.toLowerCase() === country.name?.toLowerCase()) === index,
  );
};

export const createServiceLocation = async (payload) => {

  if (!payload.name?.trim()) {
    throw new ApiError(400, 'Service location name is required');
  }

  await ensureServiceLocationsSeeded();
  const persistedLocation = await ServiceLocation.create(normalizeServiceLocationPayload(payload));
  return persistedLocation.toObject();

  const location = {
    _id: nextId(),
    name: payload.name.trim(),
    service_location_name: payload.name.trim(),
    address: payload.address || '',
    country: payload.country || 'India',
    currency_name: payload.currency_name || 'Indian Rupee',
    currency_symbol: payload.currency_symbol || '₹',
    currency_code: payload.currency_code || 'INR',
    timezone: payload.timezone || 'Asia/Kolkata',
    unit: payload.unit || 'km',
    latitude: Number(payload.latitude || 22.7196),
    longitude: Number(payload.longitude || 75.8577),
    status: payload.status || 'active',
    active: payload.status ? payload.status === 'active' : true,
    createdAt: new Date(),
  };

  state.serviceLocations.unshift(location);
  await state.save();
  return location;
};

export const updateServiceLocation = async (id, payload) => {
  await ensureServiceLocationsSeeded();
  const persistedLocation = await ServiceLocation.findById(id);
  if (!persistedLocation) {
    throw new ApiError(404, 'Service location not found');
  }
  Object.assign(persistedLocation, normalizeServiceLocationPayload(payload, persistedLocation.toObject()));
  await persistedLocation.save();
  return persistedLocation.toObject();

  const state = await ensureAdminState();
  const location = findById(state.serviceLocations, id);

  if (!location) {
    throw new ApiError(404, 'Service location not found');
  }

  Object.assign(location, payload, {
    name: payload.name?.trim() || location.name,
    service_location_name: payload.name?.trim() || location.service_location_name,
    latitude: payload.latitude !== undefined ? Number(payload.latitude) : location.latitude,
    longitude: payload.longitude !== undefined ? Number(payload.longitude) : location.longitude,
    active: payload.status !== undefined ? payload.status === 'active' : location.active,
    status: payload.status || location.status,
  });

  await state.save();
  return location;
};

export const deleteServiceLocation = async (id) => {
  await ensureServiceLocationsSeeded();
  const deleted = await ServiceLocation.findByIdAndDelete(id);
  if (!deleted) {
    throw new ApiError(404, 'Service location not found');
  }
  return true;

  const state = await ensureAdminState();
  state.serviceLocations = removeById(state.serviceLocations, id);
  await state.save();
  return true;
};

export const listNearbyServiceLocations = async ({ latitude, longitude, maxDistance = 50000, limit = 20 }) => {
  await ensureServiceLocationsSeeded();

  const lat = Number(latitude);
  const lng = Number(longitude);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    throw new ApiError(400, 'Valid latitude and longitude are required');
  }

  return ServiceLocation.find({
    location: {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [lng, lat],
        },
        $maxDistance: Number(maxDistance),
      },
    },
  })
    .limit(Number(limit) || 20)
    .lean();
};

export const listRideModules = async () => (await ensureAdminState()).rideModules;

export const listVehicleTypes = async (locationId, transportType) => {
  const state = await ensureAdminState();
  return state.vehicleTypes.filter((item) => {
    const sameLocation = !locationId || String(item.location_id) === String(locationId);
    const sameTransport = !transportType || item.transport_type === transportType;
    return sameLocation && sameTransport;
  });
};

export const listVehicleCatalog = async () => {
  const state = await ensureAdminState();
  const preferenceLookup = new Map(
    (state.preferences || []).map((preference) => [String(preference._id), preference]),
  );

  const items = await Vehicle.find().sort({ createdAt: -1 }).lean();

  const normalizedItems = items.map((item) => ({
    ...item,
    supported_other_vehicle_types: Array.isArray(item.supported_other_vehicle_types)
      ? item.supported_other_vehicle_types.map((value) => String(value))
      : [],
    vehicle_preference: Array.isArray(item.vehicle_preference)
      ? item.vehicle_preference.map((value) => String(value))
      : [],
    vehicle_preference_details: Array.isArray(item.vehicle_preference)
      ? item.vehicle_preference
          .map((value) => preferenceLookup.get(String(value)))
          .filter(Boolean)
      : [],
  }));

  return { vehicle_types: normalizedItems };
};

export const listVehiclePreferences = async () => {
  return listPreferences();
};

export const createVehicleType = async (payload) => {
  if (!payload.name?.trim()) {
    throw new ApiError(400, 'Vehicle name is required');
  }

  if (!payload.transport_type?.trim()) {
    throw new ApiError(400, 'Transport type is required');
  }

  const vehicle = await Vehicle.create({
    name: payload.name.trim(),
    short_description: payload.short_description ?? '',
    description: payload.description ?? '',
    transport_type: payload.transport_type,
    dispatch_type: payload.dispatch_type || 'normal',
    icon_types: payload.icon_types || 'car',
    image: payload.image ?? '',
    status: Number(payload.status ?? 1) ? 1 : 0,
    active: Number(payload.status ?? 1) === 1,
    supported_other_vehicle_types: Array.isArray(payload.supported_other_vehicle_types)
      ? payload.supported_other_vehicle_types.filter(Boolean).map(toObjectId)
      : [],
    vehicle_preference: Array.isArray(payload.vehicle_preference)
      ? payload.vehicle_preference.filter(Boolean).map(toObjectId)
      : [],
  });

  return vehicle.toObject();
};

export const updateVehicleType = async (id, payload) => {
  const vehicle = await Vehicle.findById(id);
  if (!vehicle) {
    throw new ApiError(404, 'Vehicle type not found');
  }

  if (payload.name !== undefined) {
    vehicle.name = String(payload.name).trim();
  }
  if (payload.short_description !== undefined) {
    vehicle.short_description = payload.short_description ?? '';
  }
  if (payload.description !== undefined) {
    vehicle.description = payload.description ?? '';
  }
  if (payload.transport_type !== undefined) {
    vehicle.transport_type = payload.transport_type;
  }
  if (payload.dispatch_type !== undefined) {
    vehicle.dispatch_type = payload.dispatch_type || 'normal';
  }
  if (payload.icon_types !== undefined) {
    vehicle.icon_types = payload.icon_types || 'car';
  }
  if (payload.image !== undefined) {
    vehicle.image = payload.image ?? '';
  }
  if (payload.status !== undefined) {
    vehicle.status = Number(payload.status) ? 1 : 0;
    vehicle.active = vehicle.status === 1;
  }
  if (payload.supported_other_vehicle_types !== undefined) {
    vehicle.supported_other_vehicle_types = Array.isArray(payload.supported_other_vehicle_types)
      ? payload.supported_other_vehicle_types.filter(Boolean).map(toObjectId)
      : [];
  }
  if (payload.vehicle_preference !== undefined) {
    vehicle.vehicle_preference = Array.isArray(payload.vehicle_preference)
      ? payload.vehicle_preference.filter(Boolean).map(toObjectId)
      : [];
  }

  await vehicle.save();
  return vehicle.toObject();
};

export const deleteVehicleType = async (id) => {
  const deleted = await Vehicle.findByIdAndDelete(id);
  if (!deleted) {
    throw new ApiError(404, 'Vehicle type not found');
  }
  return true;
};

export const listOwners = async () => {
  const owners = await Owner.find()
    .populate('service_location_id', 'name service_location_name')
    .sort({ createdAt: -1 })
    .lean();

  return owners.map(serializeOwner);
};

export const createOwner = async (payload) => {
  if (!payload.company_name?.trim()) {
    throw new ApiError(400, 'Company name is required');
  }
  if (!payload.name?.trim()) {
    throw new ApiError(400, 'Owner name is required');
  }
  if (!payload.mobile?.trim()) {
    throw new ApiError(400, 'Mobile number is required');
  }
  if (!payload.email?.trim()) {
    throw new ApiError(400, 'Email is required');
  }
  if (!payload.password || String(payload.password).length < 6) {
    throw new ApiError(400, 'Password must be at least 6 characters');
  }
  if (payload.password !== payload.password_confirmation) {
    throw new ApiError(400, 'Passwords do not match');
  }

  const normalizedEmail = String(payload.email).trim().toLowerCase();
  const normalizedMobile = String(payload.mobile).trim();

  const existingOwner = await Owner.findOne({
    $or: [{ email: normalizedEmail }, { mobile: normalizedMobile }],
  }).lean();

  if (existingOwner) {
    throw new ApiError(409, 'Owner with this email or mobile already exists');
  }

  const owner = await Owner.create({
    company_name: String(payload.company_name).trim(),
    name: String(payload.name).trim(),
    mobile: normalizedMobile,
    email: normalizedEmail,
    password: await hashPassword(String(payload.password)),
    service_location_id: payload.service_location_id ? toObjectId(payload.service_location_id) : null,
    transport_type: payload.transport_type || 'taxi',
    active: normalizeBoolean(payload.active ?? true),
    approve: normalizeBoolean(payload.approve ?? false),
    status: normalizeBoolean(payload.approve ?? false) ? 'approved' : 'pending',
  });

  const populatedOwner = await Owner.findById(owner._id)
    .populate('service_location_id', 'name service_location_name')
    .lean();

  return serializeOwner(populatedOwner);
};

export const updateOwner = async (id, payload) => {
  const owner = await Owner.findById(id);
  if (!owner) throw new ApiError(404, 'Owner not found');

  if (payload.company_name !== undefined) {
    owner.company_name = String(payload.company_name).trim();
  }
  if (payload.name !== undefined) {
    owner.name = String(payload.name).trim();
  }
  if (payload.mobile !== undefined) {
    const mobile = String(payload.mobile).trim();
    const duplicateMobile = await Owner.findOne({ _id: { $ne: id }, mobile }).lean();
    if (duplicateMobile) {
      throw new ApiError(409, 'Another owner already uses this mobile number');
    }
    owner.mobile = mobile;
  }
  if (payload.email !== undefined) {
    const email = String(payload.email).trim().toLowerCase();
    const duplicateEmail = await Owner.findOne({ _id: { $ne: id }, email }).lean();
    if (duplicateEmail) {
      throw new ApiError(409, 'Another owner already uses this email');
    }
    owner.email = email;
  }
  if (payload.service_location_id !== undefined) {
    owner.service_location_id = payload.service_location_id ? toObjectId(payload.service_location_id) : null;
  }
  if (payload.transport_type !== undefined) {
    owner.transport_type = payload.transport_type || 'taxi';
  }
  if (payload.active !== undefined) {
    owner.active = normalizeBoolean(payload.active);
  }
  if (payload.approve !== undefined) {
    owner.approve = normalizeBoolean(payload.approve);
    owner.status = owner.approve ? 'approved' : 'pending';
  }
  if (payload.password) {
    if (String(payload.password).length < 6) {
      throw new ApiError(400, 'Password must be at least 6 characters');
    }
    if (payload.password !== payload.password_confirmation) {
      throw new ApiError(400, 'Passwords do not match');
    }
    owner.password = await hashPassword(String(payload.password));
  }

  await owner.save();

  const populatedOwner = await Owner.findById(owner._id)
    .populate('service_location_id', 'name service_location_name')
    .lean();

  return serializeOwner(populatedOwner);
};

export const approveOwner = async (id, payload) =>
  updateOwner(id, { approve: normalizeBoolean(payload.approve), active: true });

export const deleteOwner = async (id) => {
  const owner = await Owner.findByIdAndDelete(id);
  if (!owner) throw new ApiError(404, 'Owner not found');
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

export const listNotificationChannels = async () =>
  (await ensureThirdPartySettings()).notification_channels;

export const toggleChannelPush = async (id, status) => {
  const settings = await ensureThirdPartySettings();
  const index = settings.notification_channels.findIndex((c) => String(c._id) === String(id));
  if (index === -1) throw new ApiError(404, 'Channel not found');

  settings.notification_channels[index].push_notification = !!status;
  settings.markModified('notification_channels');
  await settings.save();
  return settings.notification_channels[index];
};

export const toggleChannelMail = async (id, status) => {
  const settings = await ensureThirdPartySettings();
  const index = settings.notification_channels.findIndex((c) => String(c._id) === String(id));
  if (index === -1) throw new ApiError(404, 'Channel not found');

  settings.notification_channels[index].mail = !!status;
  settings.markModified('notification_channels');
  await settings.save();
  return settings.notification_channels[index];
};

export const listPaymentGateways = async () => []; // Legacy or static list if needed

export const getPaymentSettings = async () => {
  const settings = await ensureThirdPartySettings();
  return { settings: settings.payment || {} };
};

export const updatePaymentSettings = async (payload) => {
  const settings = await ensureThirdPartySettings();
  settings.payment = deepMerge(settings.payment || {}, payload);
  settings.markModified('payment');
  await settings.save();
  return { settings: settings.payment };
};

export const getSMSSettings = async () => {
  const settings = await ensureThirdPartySettings();
  return { settings: settings.sms || {} };
};

export const updateSMSSettings = async (payload) => {
  const settings = await ensureThirdPartySettings();
  settings.sms = deepMerge(settings.sms || {}, payload);
  settings.markModified('sms');
  await settings.save();
  return { settings: settings.sms };
};

export const getFirebaseSettings = async () => {
  const settings = await ensureThirdPartySettings();
  return { settings: settings.firebase || {} };
};

export const updateFirebaseSettings = async (payload) => {
  const settings = await ensureThirdPartySettings();
  settings.firebase = {
    ...settings.firebase,
    ...payload,
    firebase_json_name: payload.firebase_json_name || settings.firebase.firebase_json_name,
  };
  settings.markModified('firebase');
  await settings.save();
  return { settings: settings.firebase };
};

export const getMapSettings = async () => {
  const settings = await ensureThirdPartySettings();
  return { settings: settings.map_apis || {} };
};

export const updateMapSettings = async (payload) => {
  const settings = await ensureThirdPartySettings();
  settings.map_apis = { ...settings.map_apis, ...payload };
  settings.markModified('map_apis');
  await settings.save();
  return { settings: settings.map_apis };
};

export const getMailSettings = async () => {
  const settings = await ensureThirdPartySettings();
  return { settings: settings.mail || {} };
};

export const updateMailSettings = async (payload) => {
  const settings = await ensureThirdPartySettings();
  settings.mail = { ...settings.mail, ...payload };
  settings.markModified('mail');
  await settings.save();
  return { settings: settings.mail };
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
  const owners = await listOwners();
  return csvFromRows(
    ['company_name', 'name', 'email', 'transport_type', 'active'],
    owners.map((item) => ({
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
  const owners = await listOwners();
  return csvFromRows(
    ['company_name', 'owner', 'transport_type', 'active'],
    owners.map((item) => ({
      company_name: item.company_name,
      owner: item.name,
      transport_type: item.transport_type,
      active: item.active,
    })),
  );
};

export const ensureBusinessSettings = async () => {
  let settings = await AdminBusinessSetting.findOne({ scope: 'default' });
  if (!settings) {
    settings = await AdminBusinessSetting.create(createDefaultBusinessSettings());
  }
  return settings;
};

/**
 * Ensures a default third-party settings document exists.
 */
export const ensureThirdPartySettings = async () => {
  let settings = await AdminThirdPartySetting.findOne({ scope: 'default' });
  if (!settings) {
    settings = await AdminThirdPartySetting.create(createDefaultThirdPartySettings());
  }
  return settings;
};

import { AdminAppSetting } from '../models/AdminAppSetting.js';
import { createDefaultAppSettings } from '../data/defaultAppSettings.js';

/**
 * Ensures a default administrative application settings document exists.
 */
export const ensureAppSettings = async () => {
  let settings = await AdminAppSetting.findOne({ scope: 'default' });
  if (!settings) {
    settings = await AdminAppSetting.create(createDefaultAppSettings());
  }
  return settings;
};

export const getGeneralSettings = async (category) => {
  const bizSettings = await ensureBusinessSettings();
  const appSettings = await ensureAppSettings();

  const businessMapper = {
    customize: 'customization',
    'transport-ride': 'transport_ride',
    'bid-ride': 'bid_ride',
    general: 'general',
  };

  const appMapper = {
    wallet: 'wallet_setting',
    tip: 'tip_setting',
  };

  if (appMapper[category]) {
    return { settings: appSettings[appMapper[category]] || {} };
  }

  const key = businessMapper[category] || category;
  return { settings: bizSettings[key] || {} };
};

export const updateGeneralSettings = async (category, payload) => {
  const bizSettings = await ensureBusinessSettings();
  const appSettings = await ensureAppSettings();

  const businessMapper = {
    customize: 'customization',
    'transport-ride': 'transport_ride',
    'bid-ride': 'bid_ride',
    general: 'general',
  };

  const appMapper = {
    wallet: 'wallet_setting',
    tip: 'tip_setting',
  };

  const newValues = payload.settings || payload;

  if (appMapper[category]) {
    const key = appMapper[category];
    appSettings[key] = { ...(appSettings[key] || {}), ...newValues };
    appSettings.markModified(key);
    await appSettings.save();
    return { settings: appSettings[key] };
  }

  const bizKey = businessMapper[category] || category;
  if (!bizSettings.schema.path(bizKey)) {
    return { settings: {} };
  }

  bizSettings[bizKey] = { ...(bizSettings[bizKey] || {}), ...newValues };
  bizSettings.markModified(bizKey);
  await bizSettings.save();
  return { settings: bizSettings[bizKey] };
};

export const listAppModules = async ({ page = 1, limit = 20 }) => {
  const settings = await ensureAppSettings();
  const items = [...(settings.app_modules || [])].sort(
    (a, b) => Number(a.order_by || 0) - Number(b.order_by || 0),
  );
  return buildPaginator(items, page, limit);
};

export const createAppModule = async (payload) => {
  const settings = await ensureAppSettings();
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
  settings.app_modules.unshift(moduleItem);
  settings.markModified('app_modules');
  await settings.save();
  return moduleItem;
};

export const updateAppModule = async (id, payload) => {
  const settings = await ensureAppSettings();
  const index = settings.app_modules.findIndex((m) => String(m._id) === String(id));
  if (index === -1) throw new ApiError(404, 'App module not found');

  const moduleItem = settings.app_modules[index];
  Object.assign(moduleItem, payload, {
    order_by: payload.order_by !== undefined ? Number(payload.order_by) : moduleItem.order_by,
    active: payload.active !== undefined ? normalizeBoolean(payload.active) : moduleItem.active,
  });

  settings.app_modules[index] = moduleItem;
  settings.markModified('app_modules');
  await settings.save();
  return moduleItem;
};

export const deleteAppModule = async (id) => {
  const settings = await ensureAppSettings();
  settings.app_modules = settings.app_modules.filter((m) => String(m._id) === String(id));
  settings.markModified('app_modules');
  await settings.save();
  return true;
};

export const listOnboardingScreens = async (audience) => {
  const settings = await ensureAppSettings();
  return (settings.onboarding_screens || []).filter(
    (screen) => screen.audience === audience || screen.screen === audience,
  );
};
