import mongoose from 'mongoose';
import { ApiError } from '../../../../utils/ApiError.js';
import { createDefaultAdminState } from '../data/defaultAdminState.js';
import { AdminPanelState } from '../models/AdminPanelState.js';
import { Airport } from '../models/Airport.js';
import { GoodsType } from '../models/GoodsType.js';
import { OwnerNeededDocument } from '../models/OwnerNeededDocument.js';
import { OwnerBooking } from '../models/OwnerBooking.js';
import { Owner } from '../models/Owner.js';
import { RentalPackageType } from '../models/RentalPackageType.js';
import { SetPrice } from '../models/SetPrice.js';
import { ServiceLocation } from '../models/ServiceLocation.js';
import { Vehicle } from '../models/Vehicle.js';
import { Driver } from '../../driver/models/Driver.js';
import { Zone } from '../../driver/models/Zone.js';
import { hashPassword } from '../../driver/services/authService.js';

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

const toNullableNumber = (value) => {
  if (value === '' || value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

const normalizeZoneCoordinates = (coordinates = []) => {
  if (!Array.isArray(coordinates) || coordinates.length < 3) {
    throw new ApiError(400, 'Zone polygon requires at least 3 points');
  }

  const ring = coordinates
    .map((point) => {
      const lat = Number(point?.lat);
      const lng = Number(point?.lng);

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        throw new ApiError(400, 'Zone polygon contains invalid coordinates');
      }

      return [lng, lat];
    });

  const [firstLng, firstLat] = ring[0];
  const [lastLng, lastLat] = ring[ring.length - 1];

  if (firstLng !== lastLng || firstLat !== lastLat) {
    ring.push([firstLng, firstLat]);
  }

  return ring;
};

const normalizeAirportBoundary = (coordinates = []) => normalizeZoneCoordinates(coordinates);

const serializeZone = (zone) => ({
  _id: zone._id,
  id: zone._id,
  name: zone.name || '',
  service_location_id: zone.service_location_id?._id || zone.service_location_id || '',
  unit: zone.unit || 'km',
  peak_zone_ride_count: zone.peak_zone_ride_count,
  peak_zone_radius: zone.peak_zone_radius,
  peak_zone_selection_duration: zone.peak_zone_selection_duration,
  peak_zone_duration: zone.peak_zone_duration,
  peak_zone_surge_percentage: zone.peak_zone_surge_percentage,
  maximum_distance_for_regular_rides: zone.maximum_distance_for_regular_rides,
  maximum_distance_for_outstation_rides: zone.maximum_distance_for_outstation_rides,
  active: zone.active !== false,
  status: zone.status || (zone.active === false ? 'inactive' : 'active'),
  coordinates: Array.isArray(zone.geometry?.coordinates?.[0])
    ? zone.geometry.coordinates[0].map(([lng, lat]) => ({ lat: Number(lat), lng: Number(lng) }))
    : [],
  createdAt: zone.createdAt,
  updatedAt: zone.updatedAt,
});

const serializeSetPrice = (item) => ({
  _id: item._id,
  id: item._id,
  zone_id: item.zone_id
    ? {
        _id: item.zone_id._id || item.zone_id,
        name: item.zone_id.name || '',
      }
    : null,
  service_location_id: item.service_location_id
    ? {
        _id: item.service_location_id._id || item.service_location_id,
        name: item.service_location_id.service_location_name || item.service_location_id.name || '',
      }
    : null,
  transport_type: item.transport_type || '',
  vehicle_type: item.vehicle_type
    ? {
        _id: item.vehicle_type._id || item.vehicle_type,
        name: item.vehicle_type.name || '',
      }
    : null,
  vehicle_name: item.vehicle_type?.name || '',
  app_modules: item.app_modules ?? '',
  vehicle_preference: item.vehicle_preference ?? '',
  payment_type: Array.isArray(item.payment_type) ? item.payment_type : [],
  customer_commission_type: item.customer_commission_type || 'percentage',
  customer_commission: item.customer_commission,
  driver_commission_type: item.driver_commission_type || 'percentage',
  driver_commission: item.driver_commission,
  owner_commission_type: item.owner_commission_type || 'percentage',
  owner_commission: item.owner_commission,
  service_tax: item.service_tax,
  eta_sequence: item.eta_sequence,
  base_price: item.base_price,
  base_distance: item.base_distance,
  price_per_distance: item.price_per_distance,
  time_price: item.time_price,
  waiting_charge: item.waiting_charge,
  free_waiting_before: item.free_waiting_before,
  free_waiting_after: item.free_waiting_after,
  enable_airport_ride: Boolean(item.enable_airport_ride),
  enable_outstation_ride: Boolean(item.enable_outstation_ride),
  user_cancellation_fee_type: item.user_cancellation_fee_type || 'percentage',
  user_cancellation_fee: item.user_cancellation_fee,
  driver_cancellation_fee_type: item.driver_cancellation_fee_type || 'percentage',
  driver_cancellation_fee: item.driver_cancellation_fee,
  cancellation_fee_goes_to: item.cancellation_fee_goes_to || 'admin',
  enable_ride_sharing: Boolean(item.enable_ride_sharing),
  status: item.status || (item.active === false ? 'inactive' : 'active'),
  active: item.active !== false,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

const serializeGoodsType = (item) => ({
  _id: item._id,
  id: item._id,
  name: item.name || '',
  goods_type_for: item.goods_type_for || 'all',
  status: item.status || (item.active === false ? 'inactive' : 'active'),
  active: item.active !== false,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

const serializeRentalPackageType = (item) => ({
  _id: item._id,
  id: item._id,
  transport_type: item.transport_type || 'taxi',
  name: item.name || '',
  short_description: item.short_description || '',
  description: item.description || '',
  status: item.status || (item.active === false ? 'inactive' : 'active'),
  active: item.active !== false,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

const serializeOwnerNeededDocument = (item) => ({
  _id: item._id,
  id: item._id,
  name: item.name || '',
  image_type: item.image_type || 'front_back',
  has_expiry_date: Boolean(item.has_expiry_date),
  has_identify_number: Boolean(item.has_identify_number),
  is_editable: Boolean(item.is_editable),
  is_required: Boolean(item.is_required),
  active: item.active !== false,
  status: item.active === false ? 'inactive' : 'active',
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

const serializeAirport = (item) => ({
  _id: item._id,
  id: item._id,
  name: item.name || '',
  code: item.code || '',
  service_location_id: item.service_location_id
    ? {
        _id: item.service_location_id._id || item.service_location_id,
        name: item.service_location_id.service_location_name || item.service_location_id.name || '',
        country: item.service_location_id.country || '',
      }
    : null,
  zone_id: item.zone_id
    ? {
        _id: item.zone_id._id || item.zone_id,
        name: item.zone_id.name || '',
      }
    : null,
  terminal: item.terminal || '',
  address: item.address || '',
  contact_number: item.contact_number || '',
  latitude: item.latitude,
  longitude: item.longitude,
  boundary_coordinates: Array.isArray(item.boundary?.coordinates?.[0])
    ? item.boundary.coordinates[0].map(([lng, lat]) => ({ lat: Number(lat), lng: Number(lng) }))
    : [],
  status: item.status || (item.active === false ? 'inactive' : 'active'),
  active: item.active !== false,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

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

const serializeOwnerBooking = (item) => ({
  _id: item._id,
  id: item._id,
  owner_id: item.owner_id
    ? {
        _id: item.owner_id._id || item.owner_id,
        name: item.owner_id.full_name || item.owner_id.name || '',
        email: item.owner_id.email || '',
        mobile: item.owner_id.mobile || '',
      }
    : null,
  booking_reference: item.booking_reference || '',
  customer_name: item.customer_name || '',
  customer_phone: item.customer_phone || '',
  pickup_location: item.pickup_location || '',
  dropoff_location: item.dropoff_location || '',
  trip_type: item.trip_type || 'city',
  vehicle_type: item.vehicle_type || '',
  trip_date: item.trip_date,
  fare_amount: Number(item.fare_amount || 0),
  payment_status: item.payment_status || 'pending',
  booking_status: item.booking_status || 'pending',
  notes: item.notes || '',
  active: item.active !== false,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
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
  const zoneCount = await Zone.countDocuments();
  return {
    module: 'admin',
    ready: true,
    message: 'Admin module is wired and seeded',
    snapshot: {
      users: state.users.length,
      drivers: state.drivers.length,
      owners: ownerCount,
      zones: zoneCount,
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

export const listOwnerBookings = async () => {
  const items = await OwnerBooking.find()
    .populate('owner_id', 'full_name name email mobile')
    .sort({ createdAt: -1 })
    .lean();

  return items.map(serializeOwnerBooking);
};

export const createOwnerBooking = async (payload) => {
  if (!payload.booking_reference?.trim()) {
    throw new ApiError(400, 'Booking reference is required');
  }

  if (!payload.customer_name?.trim()) {
    throw new ApiError(400, 'Customer name is required');
  }

  const item = await OwnerBooking.create({
    owner_id: payload.owner_id ? toObjectId(payload.owner_id) : null,
    booking_reference: String(payload.booking_reference).trim(),
    customer_name: String(payload.customer_name).trim(),
    customer_phone: String(payload.customer_phone || '').trim(),
    pickup_location: String(payload.pickup_location || '').trim(),
    dropoff_location: String(payload.dropoff_location || '').trim(),
    trip_type: payload.trip_type || 'city',
    vehicle_type: String(payload.vehicle_type || '').trim(),
    trip_date: payload.trip_date ? new Date(payload.trip_date) : null,
    fare_amount: toNullableNumber(payload.fare_amount) ?? 0,
    payment_status: payload.payment_status || 'pending',
    booking_status: payload.booking_status || 'pending',
    notes: String(payload.notes || '').trim(),
    active: payload.active !== undefined ? normalizeBoolean(payload.active) : true,
  });

  const populatedItem = await OwnerBooking.findById(item._id)
    .populate('owner_id', 'full_name name email mobile')
    .lean();

  return serializeOwnerBooking(populatedItem);
};

export const updateOwnerBooking = async (id, payload) => {
  const item = await OwnerBooking.findById(id);
  if (!item) throw new ApiError(404, 'Owner booking not found');

  if (payload.owner_id !== undefined) {
    item.owner_id = payload.owner_id ? toObjectId(payload.owner_id) : null;
  }
  if (payload.booking_reference !== undefined) {
    item.booking_reference = String(payload.booking_reference || '').trim();
  }
  if (payload.customer_name !== undefined) {
    item.customer_name = String(payload.customer_name || '').trim();
  }
  if (payload.customer_phone !== undefined) {
    item.customer_phone = String(payload.customer_phone || '').trim();
  }
  if (payload.pickup_location !== undefined) {
    item.pickup_location = String(payload.pickup_location || '').trim();
  }
  if (payload.dropoff_location !== undefined) {
    item.dropoff_location = String(payload.dropoff_location || '').trim();
  }
  if (payload.trip_type !== undefined) {
    item.trip_type = payload.trip_type || 'city';
  }
  if (payload.vehicle_type !== undefined) {
    item.vehicle_type = String(payload.vehicle_type || '').trim();
  }
  if (payload.trip_date !== undefined) {
    item.trip_date = payload.trip_date ? new Date(payload.trip_date) : null;
  }
  if (payload.fare_amount !== undefined) {
    item.fare_amount = toNullableNumber(payload.fare_amount) ?? 0;
  }
  if (payload.payment_status !== undefined) {
    item.payment_status = payload.payment_status || 'pending';
  }
  if (payload.booking_status !== undefined) {
    item.booking_status = payload.booking_status || 'pending';
  }
  if (payload.notes !== undefined) {
    item.notes = String(payload.notes || '').trim();
  }
  if (payload.active !== undefined) {
    item.active = normalizeBoolean(payload.active);
  }

  await item.save();

  const populatedItem = await OwnerBooking.findById(item._id)
    .populate('owner_id', 'full_name name email mobile')
    .lean();

  return serializeOwnerBooking(populatedItem);
};

export const deleteOwnerBooking = async (id) => {
  const deleted = await OwnerBooking.findByIdAndDelete(id);
  if (!deleted) throw new ApiError(404, 'Owner booking not found');
  return true;
};

export const getDashboardData = async () => (await ensureAdminState()).dashboard;

export const getOverallEarnings = async () => (await ensureAdminState()).dashboard.overallEarnings;

export const getTodayEarnings = async () => (await ensureAdminState()).dashboard.todayEarnings;

export const getCancelChart = async () => (await ensureAdminState()).dashboard.cancelChart;

export const listWithdrawals = async () => (await ensureAdminState()).withdrawals;

export const listZones = async () => {
  const zones = await Zone.find()
    .populate('service_location_id', 'name service_location_name country timezone')
    .sort({ createdAt: -1 })
    .lean();

  return zones.map(serializeZone);
};

export const createZone = async (payload) => {
  if (!payload.name?.trim()) {
    throw new ApiError(400, 'Zone name is required');
  }

  const zone = await Zone.create({
    name: String(payload.name).trim(),
    service_location_id: payload.service_location_id ? toObjectId(payload.service_location_id) : null,
    unit: payload.unit || 'km',
    peak_zone_ride_count: toNullableNumber(payload.peak_zone_ride_count),
    peak_zone_radius: toNullableNumber(payload.peak_zone_radius),
    peak_zone_selection_duration: toNullableNumber(payload.peak_zone_selection_duration),
    peak_zone_duration: toNullableNumber(payload.peak_zone_duration),
    peak_zone_surge_percentage: toNullableNumber(payload.peak_zone_surge_percentage),
    maximum_distance_for_regular_rides: toNullableNumber(payload.maximum_distance_for_regular_rides),
    maximum_distance_for_outstation_rides: toNullableNumber(payload.maximum_distance_for_outstation_rides),
    active: payload.status ? payload.status === 'active' : true,
    status: payload.status || 'active',
    geometry: {
      type: 'Polygon',
      coordinates: [normalizeZoneCoordinates(payload.coordinates)],
    },
  });

  const populatedZone = await Zone.findById(zone._id)
    .populate('service_location_id', 'name service_location_name country timezone')
    .lean();

  return serializeZone(populatedZone);
};

export const updateZone = async (id, payload) => {
  const zone = await Zone.findById(id);
  if (!zone) throw new ApiError(404, 'Zone not found');

  if (payload.name !== undefined) {
    zone.name = String(payload.name).trim();
  }
  if (payload.service_location_id !== undefined) {
    zone.service_location_id = payload.service_location_id ? toObjectId(payload.service_location_id) : null;
  }
  if (payload.unit !== undefined) {
    zone.unit = payload.unit || 'km';
  }
  if (payload.peak_zone_ride_count !== undefined) {
    zone.peak_zone_ride_count = toNullableNumber(payload.peak_zone_ride_count);
  }
  if (payload.peak_zone_radius !== undefined) {
    zone.peak_zone_radius = toNullableNumber(payload.peak_zone_radius);
  }
  if (payload.peak_zone_selection_duration !== undefined) {
    zone.peak_zone_selection_duration = toNullableNumber(payload.peak_zone_selection_duration);
  }
  if (payload.peak_zone_duration !== undefined) {
    zone.peak_zone_duration = toNullableNumber(payload.peak_zone_duration);
  }
  if (payload.peak_zone_surge_percentage !== undefined) {
    zone.peak_zone_surge_percentage = toNullableNumber(payload.peak_zone_surge_percentage);
  }
  if (payload.maximum_distance_for_regular_rides !== undefined) {
    zone.maximum_distance_for_regular_rides = toNullableNumber(payload.maximum_distance_for_regular_rides);
  }
  if (payload.maximum_distance_for_outstation_rides !== undefined) {
    zone.maximum_distance_for_outstation_rides = toNullableNumber(payload.maximum_distance_for_outstation_rides);
  }
  if (payload.status !== undefined) {
    zone.status = payload.status || 'active';
    zone.active = zone.status === 'active';
  }
  if (payload.coordinates !== undefined) {
    zone.geometry = {
      type: 'Polygon',
      coordinates: [normalizeZoneCoordinates(payload.coordinates)],
    };
  }

  await zone.save();

  const populatedZone = await Zone.findById(zone._id)
    .populate('service_location_id', 'name service_location_name country timezone')
    .lean();

  return serializeZone(populatedZone);
};

export const deleteZone = async (id) => {
  const deleted = await Zone.findByIdAndDelete(id);
  if (!deleted) throw new ApiError(404, 'Zone not found');
  return true;
};

export const toggleZoneStatus = async (id) => {
  const zone = await Zone.findById(id);
  if (!zone) throw new ApiError(404, 'Zone not found');
  zone.active = !zone.active;
  zone.status = zone.active ? 'active' : 'inactive';
  await zone.save();

  const populatedZone = await Zone.findById(zone._id)
    .populate('service_location_id', 'name service_location_name country timezone')
    .lean();

  return serializeZone(populatedZone);
};

export const listSetPrices = async () => {
  const items = await SetPrice.find()
    .populate('zone_id', 'name')
    .populate('service_location_id', 'name service_location_name')
    .populate('vehicle_type', 'name')
    .sort({ createdAt: -1 })
    .lean();

  return items.map(serializeSetPrice);
};

export const listAirports = async () => {
  const items = await Airport.find()
    .populate('service_location_id', 'name service_location_name country')
    .populate('zone_id', 'name')
    .sort({ createdAt: -1 })
    .lean();

  return items.map(serializeAirport);
};

export const createAirport = async (payload) => {
  if (!payload.name?.trim()) {
    throw new ApiError(400, 'Airport name is required');
  }

  if (!payload.service_location_id) {
    throw new ApiError(400, 'Service location is required');
  }

  const latitude = toNullableNumber(payload.latitude);
  const longitude = toNullableNumber(payload.longitude);
  const status = payload.status || (normalizeBoolean(payload.active ?? true) ? 'active' : 'inactive');

  const item = await Airport.create({
    name: String(payload.name).trim(),
    code: String(payload.code || '').trim().toUpperCase(),
    service_location_id: toObjectId(payload.service_location_id),
    zone_id: payload.zone_id ? toObjectId(payload.zone_id) : null,
    terminal: String(payload.terminal || '').trim(),
    address: String(payload.address || '').trim(),
    contact_number: String(payload.contact_number || '').trim(),
    latitude,
    longitude,
    location:
      latitude !== null && longitude !== null
        ? {
            type: 'Point',
            coordinates: [longitude, latitude],
          }
        : undefined,
    boundary:
      Array.isArray(payload.boundary_coordinates) && payload.boundary_coordinates.length >= 3
        ? {
            type: 'Polygon',
            coordinates: [normalizeAirportBoundary(payload.boundary_coordinates)],
          }
        : undefined,
    status,
    active: status === 'active',
  });

  const populatedItem = await Airport.findById(item._id)
    .populate('service_location_id', 'name service_location_name country')
    .populate('zone_id', 'name')
    .lean();

  return serializeAirport(populatedItem);
};

export const updateAirport = async (id, payload) => {
  const item = await Airport.findById(id);
  if (!item) throw new ApiError(404, 'Airport not found');

  if (payload.name !== undefined) {
    item.name = String(payload.name || '').trim();
  }
  if (payload.code !== undefined) {
    item.code = String(payload.code || '').trim().toUpperCase();
  }
  if (payload.service_location_id !== undefined) {
    item.service_location_id = payload.service_location_id ? toObjectId(payload.service_location_id) : null;
  }
  if (payload.zone_id !== undefined) {
    item.zone_id = payload.zone_id ? toObjectId(payload.zone_id) : null;
  }
  if (payload.terminal !== undefined) {
    item.terminal = String(payload.terminal || '').trim();
  }
  if (payload.address !== undefined) {
    item.address = String(payload.address || '').trim();
  }
  if (payload.contact_number !== undefined) {
    item.contact_number = String(payload.contact_number || '').trim();
  }
  if (payload.latitude !== undefined) {
    item.latitude = toNullableNumber(payload.latitude);
  }
  if (payload.longitude !== undefined) {
    item.longitude = toNullableNumber(payload.longitude);
  }
  if (payload.status !== undefined || payload.active !== undefined) {
    item.status = payload.status || (normalizeBoolean(payload.active) ? 'active' : 'inactive');
    item.active = item.status === 'active';
  }
  if (payload.boundary_coordinates !== undefined) {
    item.boundary =
      Array.isArray(payload.boundary_coordinates) && payload.boundary_coordinates.length >= 3
        ? {
            type: 'Polygon',
            coordinates: [normalizeAirportBoundary(payload.boundary_coordinates)],
          }
        : undefined;
  }

  item.location =
    item.latitude !== null && item.longitude !== null
      ? {
          type: 'Point',
          coordinates: [item.longitude, item.latitude],
        }
      : undefined;

  await item.save();

  const populatedItem = await Airport.findById(item._id)
    .populate('service_location_id', 'name service_location_name country')
    .populate('zone_id', 'name')
    .lean();

  return serializeAirport(populatedItem);
};

export const deleteAirport = async (id) => {
  const item = await Airport.findByIdAndDelete(id);
  if (!item) throw new ApiError(404, 'Airport not found');
  return true;
};

export const createSetPrice = async (payload) => {
  const item = await SetPrice.create({
    zone_id: payload.zone_id ? toObjectId(payload.zone_id) : null,
    service_location_id: payload.service_location_id ? toObjectId(payload.service_location_id) : null,
    transport_type: payload.transport_type || 'taxi',
    vehicle_type: payload.vehicle_type ? toObjectId(payload.vehicle_type) : null,
    app_modules: payload.app_modules ?? null,
    vehicle_preference: payload.vehicle_preference ?? null,
    payment_type: Array.isArray(payload.payment_type) ? payload.payment_type : [payload.payment_type || 'cash'],
    customer_commission_type: payload.customer_commission_type || 'percentage',
    customer_commission: toNullableNumber(payload.customer_commission),
    driver_commission_type: payload.driver_commission_type || 'percentage',
    driver_commission: toNullableNumber(payload.driver_commission),
    owner_commission_type: payload.owner_commission_type || 'percentage',
    owner_commission: toNullableNumber(payload.owner_commission),
    service_tax: toNullableNumber(payload.service_tax),
    eta_sequence: toNullableNumber(payload.eta_sequence),
    base_price: toNullableNumber(payload.base_price),
    base_distance: toNullableNumber(payload.base_distance),
    price_per_distance: toNullableNumber(payload.price_per_distance),
    time_price: toNullableNumber(payload.time_price),
    waiting_charge: toNullableNumber(payload.waiting_charge),
    free_waiting_before: toNullableNumber(payload.free_waiting_before),
    free_waiting_after: toNullableNumber(payload.free_waiting_after),
    enable_airport_ride: normalizeBoolean(payload.enable_airport_ride),
    enable_outstation_ride: normalizeBoolean(payload.enable_outstation_ride),
    user_cancellation_fee_type: payload.user_cancellation_fee_type || 'percentage',
    user_cancellation_fee: toNullableNumber(payload.user_cancellation_fee),
    driver_cancellation_fee_type: payload.driver_cancellation_fee_type || 'percentage',
    driver_cancellation_fee: toNullableNumber(payload.driver_cancellation_fee),
    cancellation_fee_goes_to: payload.cancellation_fee_goes_to || 'admin',
    enable_ride_sharing: normalizeBoolean(payload.enable_ride_sharing),
    status: payload.status || (normalizeBoolean(payload.active ?? true) ? 'active' : 'inactive'),
    active: payload.active !== undefined ? normalizeBoolean(payload.active) : (payload.status ? payload.status === 'active' : true),
  });

  const populatedItem = await SetPrice.findById(item._id)
    .populate('zone_id', 'name')
    .populate('service_location_id', 'name service_location_name')
    .populate('vehicle_type', 'name')
    .lean();

  return serializeSetPrice(populatedItem);
};

export const updateSetPrice = async (id, payload) => {
  const item = await SetPrice.findById(id);
  if (!item) throw new ApiError(404, 'Set price not found');

  if (payload.zone_id !== undefined) {
    item.zone_id = payload.zone_id ? toObjectId(payload.zone_id) : null;
  }
  if (payload.service_location_id !== undefined) {
    item.service_location_id = payload.service_location_id ? toObjectId(payload.service_location_id) : null;
  }
  if (payload.transport_type !== undefined) {
    item.transport_type = payload.transport_type || 'taxi';
  }
  if (payload.vehicle_type !== undefined) {
    item.vehicle_type = payload.vehicle_type ? toObjectId(payload.vehicle_type) : null;
  }
  if (payload.app_modules !== undefined) {
    item.app_modules = payload.app_modules ?? null;
  }
  if (payload.vehicle_preference !== undefined) {
    item.vehicle_preference = payload.vehicle_preference ?? null;
  }
  if (payload.payment_type !== undefined) {
    item.payment_type = Array.isArray(payload.payment_type) ? payload.payment_type : [payload.payment_type || 'cash'];
  }
  if (payload.customer_commission_type !== undefined) {
    item.customer_commission_type = payload.customer_commission_type || 'percentage';
  }
  if (payload.customer_commission !== undefined) {
    item.customer_commission = toNullableNumber(payload.customer_commission);
  }
  if (payload.driver_commission_type !== undefined) {
    item.driver_commission_type = payload.driver_commission_type || 'percentage';
  }
  if (payload.driver_commission !== undefined) {
    item.driver_commission = toNullableNumber(payload.driver_commission);
  }
  if (payload.owner_commission_type !== undefined) {
    item.owner_commission_type = payload.owner_commission_type || 'percentage';
  }
  if (payload.owner_commission !== undefined) {
    item.owner_commission = toNullableNumber(payload.owner_commission);
  }
  if (payload.service_tax !== undefined) {
    item.service_tax = toNullableNumber(payload.service_tax);
  }
  if (payload.eta_sequence !== undefined) {
    item.eta_sequence = toNullableNumber(payload.eta_sequence);
  }
  if (payload.base_price !== undefined) {
    item.base_price = toNullableNumber(payload.base_price);
  }
  if (payload.base_distance !== undefined) {
    item.base_distance = toNullableNumber(payload.base_distance);
  }
  if (payload.price_per_distance !== undefined) {
    item.price_per_distance = toNullableNumber(payload.price_per_distance);
  }
  if (payload.time_price !== undefined) {
    item.time_price = toNullableNumber(payload.time_price);
  }
  if (payload.waiting_charge !== undefined) {
    item.waiting_charge = toNullableNumber(payload.waiting_charge);
  }
  if (payload.free_waiting_before !== undefined) {
    item.free_waiting_before = toNullableNumber(payload.free_waiting_before);
  }
  if (payload.free_waiting_after !== undefined) {
    item.free_waiting_after = toNullableNumber(payload.free_waiting_after);
  }
  if (payload.enable_airport_ride !== undefined) {
    item.enable_airport_ride = normalizeBoolean(payload.enable_airport_ride);
  }
  if (payload.enable_outstation_ride !== undefined) {
    item.enable_outstation_ride = normalizeBoolean(payload.enable_outstation_ride);
  }
  if (payload.user_cancellation_fee_type !== undefined) {
    item.user_cancellation_fee_type = payload.user_cancellation_fee_type || 'percentage';
  }
  if (payload.user_cancellation_fee !== undefined) {
    item.user_cancellation_fee = toNullableNumber(payload.user_cancellation_fee);
  }
  if (payload.driver_cancellation_fee_type !== undefined) {
    item.driver_cancellation_fee_type = payload.driver_cancellation_fee_type || 'percentage';
  }
  if (payload.driver_cancellation_fee !== undefined) {
    item.driver_cancellation_fee = toNullableNumber(payload.driver_cancellation_fee);
  }
  if (payload.cancellation_fee_goes_to !== undefined) {
    item.cancellation_fee_goes_to = payload.cancellation_fee_goes_to || 'admin';
  }
  if (payload.enable_ride_sharing !== undefined) {
    item.enable_ride_sharing = normalizeBoolean(payload.enable_ride_sharing);
  }
  if (payload.status !== undefined) {
    item.status = payload.status || 'active';
    item.active = item.status === 'active';
  } else if (payload.active !== undefined) {
    item.active = normalizeBoolean(payload.active);
    item.status = item.active ? 'active' : 'inactive';
  }

  await item.save();

  const populatedItem = await SetPrice.findById(item._id)
    .populate('zone_id', 'name')
    .populate('service_location_id', 'name service_location_name')
    .populate('vehicle_type', 'name')
    .lean();

  return serializeSetPrice(populatedItem);
};

export const deleteSetPrice = async (id) => {
  const deleted = await SetPrice.findByIdAndDelete(id);
  if (!deleted) throw new ApiError(404, 'Set price not found');
  return true;
};

export const listGoodsTypes = async () => {
  const items = await GoodsType.find().sort({ createdAt: -1 }).lean();
  return items.map(serializeGoodsType);
};

export const createGoodsType = async (payload) => {
  if (!payload.name?.trim()) {
    throw new ApiError(400, 'Goods type name is required');
  }

  const item = await GoodsType.create({
    name: String(payload.name).trim(),
    goods_type_for: payload.goods_type_for || 'all',
    status: payload.status || 'active',
    active: payload.active !== undefined ? normalizeBoolean(payload.active) : ((payload.status || 'active') === 'active'),
  });

  return serializeGoodsType(item.toObject());
};

export const updateGoodsType = async (id, payload) => {
  const item = await GoodsType.findById(id);
  if (!item) throw new ApiError(404, 'Goods type not found');

  if (payload.name !== undefined) {
    item.name = String(payload.name).trim();
  }
  if (payload.goods_type_for !== undefined) {
    item.goods_type_for = payload.goods_type_for || 'all';
  }
  if (payload.status !== undefined) {
    item.status = payload.status || 'active';
    item.active = item.status === 'active';
  } else if (payload.active !== undefined) {
    item.active = normalizeBoolean(payload.active);
    item.status = item.active ? 'active' : 'inactive';
  }

  await item.save();
  return serializeGoodsType(item.toObject());
};

export const deleteGoodsType = async (id) => {
  const deleted = await GoodsType.findByIdAndDelete(id);
  if (!deleted) throw new ApiError(404, 'Goods type not found');
  return true;
};

export const listRentalPackageTypes = async () => {
  const items = await RentalPackageType.find().sort({ createdAt: -1 }).lean();
  return items.map(serializeRentalPackageType);
};

export const createRentalPackageType = async (payload) => {
  if (!payload.name?.trim()) {
    throw new ApiError(400, 'Rental package type name is required');
  }

  if (!payload.transport_type?.trim()) {
    throw new ApiError(400, 'Transport type is required');
  }

  const status = payload.status || (normalizeBoolean(payload.active ?? true) ? 'active' : 'inactive');

  const item = await RentalPackageType.create({
    transport_type: String(payload.transport_type).trim().toLowerCase(),
    name: String(payload.name).trim(),
    short_description: String(payload.short_description || '').trim(),
    description: String(payload.description || '').trim(),
    status,
    active: status === 'active',
  });

  return serializeRentalPackageType(item.toObject());
};

export const updateRentalPackageType = async (id, payload) => {
  const item = await RentalPackageType.findById(id);
  if (!item) throw new ApiError(404, 'Rental package type not found');

  if (payload.transport_type !== undefined) {
    item.transport_type = String(payload.transport_type || 'taxi').trim().toLowerCase();
  }
  if (payload.name !== undefined) {
    item.name = String(payload.name || '').trim();
  }
  if (payload.short_description !== undefined) {
    item.short_description = String(payload.short_description || '').trim();
  }
  if (payload.description !== undefined) {
    item.description = String(payload.description || '').trim();
  }
  if (payload.status !== undefined) {
    item.status = payload.status || 'active';
    item.active = item.status === 'active';
  } else if (payload.active !== undefined) {
    item.active = normalizeBoolean(payload.active);
    item.status = item.active ? 'active' : 'inactive';
  }

  await item.save();
  return serializeRentalPackageType(item.toObject());
};

export const deleteRentalPackageType = async (id) => {
  const deleted = await RentalPackageType.findByIdAndDelete(id);
  if (!deleted) throw new ApiError(404, 'Rental package type not found');
  return true;
};

export const listOwnerNeededDocuments = async () => {
  const items = await OwnerNeededDocument.find().sort({ createdAt: -1 }).lean();
  return items.map(serializeOwnerNeededDocument);
};

export const createOwnerNeededDocument = async (payload) => {
  if (!payload.name?.trim()) {
    throw new ApiError(400, 'Document name is required');
  }

  const item = await OwnerNeededDocument.create({
    name: String(payload.name).trim(),
    image_type: String(payload.image_type || 'front_back').trim(),
    has_expiry_date: normalizeBoolean(payload.has_expiry_date),
    has_identify_number: normalizeBoolean(payload.has_identify_number),
    is_editable: normalizeBoolean(payload.is_editable),
    is_required: normalizeBoolean(payload.is_required),
    active: payload.active !== undefined ? normalizeBoolean(payload.active) : true,
  });

  return serializeOwnerNeededDocument(item.toObject());
};

export const updateOwnerNeededDocument = async (id, payload) => {
  const item = await OwnerNeededDocument.findById(id);
  if (!item) throw new ApiError(404, 'Owner needed document not found');

  if (payload.name !== undefined) {
    item.name = String(payload.name || '').trim();
  }
  if (payload.image_type !== undefined) {
    item.image_type = String(payload.image_type || 'front_back').trim();
  }
  if (payload.has_expiry_date !== undefined) {
    item.has_expiry_date = normalizeBoolean(payload.has_expiry_date);
  }
  if (payload.has_identify_number !== undefined) {
    item.has_identify_number = normalizeBoolean(payload.has_identify_number);
  }
  if (payload.is_editable !== undefined) {
    item.is_editable = normalizeBoolean(payload.is_editable);
  }
  if (payload.is_required !== undefined) {
    item.is_required = normalizeBoolean(payload.is_required);
  }
  if (payload.active !== undefined) {
    item.active = normalizeBoolean(payload.active);
  }

  await item.save();
  return serializeOwnerNeededDocument(item.toObject());
};

export const deleteOwnerNeededDocument = async (id) => {
  const deleted = await OwnerNeededDocument.findByIdAndDelete(id);
  if (!deleted) throw new ApiError(404, 'Owner needed document not found');
  return true;
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
