import { ApiError } from '../../../../utils/ApiError.js';
import { normalizePoint, toPoint } from '../../../../utils/geo.js';
import { Driver } from '../models/Driver.js';
import { WalletTransaction } from '../models/WalletTransaction.js';
import { Vehicle } from '../../admin/models/Vehicle.js';
import { comparePassword, hashPassword, signAccessToken } from '../services/authService.js';
import { emitToDriver } from '../../services/dispatchService.js';
import { findZoneByPickup } from '../services/locationService.js';
import { listDriverServiceLocations } from '../services/serviceLocationService.js';
import { serializeDriverWallet, topUpDriverWallet } from '../services/walletService.js';
import {
  startDriverLoginOtp,
  verifyDriverLoginOtp,
} from '../services/loginOtpService.js';
import { verifyAccessToken } from '../../services/tokenService.js';
import { clearDriverActiveRideIfStale } from '../../services/rideService.js';
import { listDriverNeededDocuments } from '../../admin/services/adminService.js';
import {
  completeDriverOnboarding,
  getDriverOnboardingSession,
  saveDriverDocuments,
  saveDriverPersonalDetails,
  saveDriverReferral,
  saveDriverVehicle,
  startDriverOnboarding,
  verifyDriverOtp,
} from '../services/onboardingService.js';

export const registerDriver = async (req, res) => {
  const { name, phone, password, vehicleType, location } = req.body;

  if (!name || !phone || !password || !vehicleType || !location) {
    throw new ApiError(400, 'name, phone, password, vehicleType and location are required');
  }

  const existingDriver = await Driver.findOne({ phone });

  if (existingDriver) {
    throw new ApiError(409, 'Phone number is already registered');
  }

  const coordinates = normalizePoint(location, 'location');
  const zone = await findZoneByPickup(coordinates);

  const driver = await Driver.create({
    name,
    phone,
    password: await hashPassword(password),
    vehicleType,
    approve: true,
    status: 'approved',
    zoneId: zone?._id || null,
    location: toPoint(coordinates, 'location'),
  });

  const token = signAccessToken({ sub: String(driver._id), role: 'driver' });

  res.status(201).json({
    success: true,
    data: {
      token,
      driver: {
        id: driver._id,
        name: driver.name,
        phone: driver.phone,
        vehicleType: driver.vehicleType,
        rating: driver.rating,
        status: driver.status,
      },
    },
  });
};

export const loginDriver = async (req, res) => {
  const { phone, password } = req.body;

  if (!phone || !password) {
    throw new ApiError(400, 'phone and password are required');
  }

  const driver = await Driver.findOne({ phone }).select('+password');

  if (!driver || !(await comparePassword(password, driver.password))) {
    throw new ApiError(401, 'Invalid phone or password');
  }

  if (driver.approve === false || String(driver.status || '').toLowerCase() === 'pending') {
    throw new ApiError(403, 'Driver account is pending approval');
  }

  await clearDriverActiveRideIfStale(driver);

  const token = signAccessToken({ sub: String(driver._id), role: 'driver' });

  res.json({
    success: true,
    data: {
      token,
      driver: {
        id: driver._id,
        name: driver.name,
        phone: driver.phone,
        vehicleType: driver.vehicleType,
        isOnline: driver.isOnline,
        isOnRide: driver.isOnRide,
        status: driver.status,
      },
    },
  });
};

export const goOnline = async (req, res) => {
  const { location } = req.body;

  const coordinates = normalizePoint(location, 'location');
  const zone = await findZoneByPickup(coordinates);
  const existingDriver = await Driver.findById(req.auth.sub);

  if (!existingDriver) {
    throw new ApiError(404, 'Driver not found');
  }

  await clearDriverActiveRideIfStale(existingDriver);

  const driver = await Driver.findByIdAndUpdate(
    req.auth.sub,
    {
      isOnline: true,
      zoneId: zone?._id || null,
      location: toPoint(coordinates, 'location'),
    },
    { new: true },
  );

  if (!driver) {
    throw new ApiError(404, 'Driver not found');
  }

  res.json({
    success: true,
    data: driver,
  });
};

export const getCurrentDriver = async (req, res) => {
  const driver = await Driver.findById(req.auth.sub);

  if (!driver) {
    throw new ApiError(404, 'Driver not found');
  }

  await clearDriverActiveRideIfStale(driver);

  res.json({
    success: true,
    data: {
      id: driver._id,
      name: driver.name,
      phone: driver.phone,
      email: driver.email,
      profileImage: driver.profileImage || '',
      gender: driver.gender,
      vehicleType: driver.vehicleType,
      vehicleTypeId: driver.vehicleTypeId,
      vehicleIconType: driver.vehicleIconType,
      vehicleMake: driver.vehicleMake,
      vehicleModel: driver.vehicleModel,
      registerFor: driver.registerFor,
      vehicleNumber: driver.vehicleNumber,
      vehicleColor: driver.vehicleColor,
      vehicleImage: driver.vehicleImage || '',
      city: driver.city,
      approve: driver.approve,
      status: driver.status,
      rating: driver.rating,
      wallet: serializeDriverWallet(driver),
      referralCode: driver.referralCode || '',
      isOnline: driver.isOnline,
      isOnRide: driver.isOnRide,
      location: driver.location,
      zoneId: driver.zoneId,
      documents: driver.documents || {},
      onboarding: driver.onboarding || {},
    },
  });
};

export const updateCurrentDriver = async (req, res) => {
  const driver = await Driver.findById(req.auth.sub);

  if (!driver) {
    throw new ApiError(404, 'Driver not found');
  }

  if (Object.prototype.hasOwnProperty.call(req.body || {}, 'name')) {
    driver.name = String(req.body.name || '').trim();
  }

  if (Object.prototype.hasOwnProperty.call(req.body || {}, 'email')) {
    driver.email = String(req.body.email || '').trim().toLowerCase();
  }

  if (Object.prototype.hasOwnProperty.call(req.body || {}, 'profileImage')) {
    driver.profileImage = String(req.body.profileImage || '').trim();
  }

  await driver.save();

  res.json({
    success: true,
    data: {
      id: driver._id,
      name: driver.name,
      phone: driver.phone,
      email: driver.email,
      profileImage: driver.profileImage || '',
    },
  });
};

export const getMyWallet = async (req, res) => {
  const driver = await Driver.findById(req.auth.sub);

  if (!driver) {
    throw new ApiError(404, 'Driver not found');
  }

  const transactions = await WalletTransaction.find({ driverId: req.auth.sub })
    .sort({ createdAt: -1 })
    .limit(50)
    .lean();

  res.json({
    success: true,
    data: {
      wallet: serializeDriverWallet(driver),
      transactions,
    },
  });
};

export const topUpMyWallet = async (req, res) => {
  const amount = Number(req.body.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new ApiError(400, 'amount must be greater than zero');
  }

  const result = await topUpDriverWallet({
    driverId: req.auth.sub,
    amount,
    metadata: {
      source: req.body.source || 'manual',
      referenceId: req.body.referenceId || null,
    },
  });

  const payload = {
    wallet: result.wallet,
    transaction: result.transaction,
  };

  emitToDriver(req.auth.sub, 'driver:wallet:updated', payload);

  res.json({
    success: true,
    data: payload,
  });
};

const getGenericVehicleType = (vehicle = {}) => {
  const value = String(vehicle.icon_types || vehicle.name || '').toLowerCase();

  if (value.includes('bike')) {
    return 'bike';
  }

  if (value.includes('auto')) {
    return 'auto';
  }

  return 'car';
};

export const updateDriverVehicle = async (req, res) => {
  const { vehicleTypeId, vehicleNumber, vehicleColor, vehicleMake, vehicleModel, vehicleImage } = req.body;

  let selectedVehicle = null;

  if (vehicleTypeId) {
    selectedVehicle = await Vehicle.findById(vehicleTypeId);

    if (!selectedVehicle || selectedVehicle.active === false || Number(selectedVehicle.status) === 0) {
      throw new ApiError(404, 'Active vehicle type not found');
    }
  }

  const update = {};

  if (selectedVehicle) {
    update.vehicleTypeId = selectedVehicle._id;
    update.vehicleType = getGenericVehicleType(selectedVehicle);
    update.vehicleIconType = selectedVehicle.icon_types || update.vehicleType;
  }

  if (vehicleNumber !== undefined) {
    update.vehicleNumber = String(vehicleNumber || '').trim().toUpperCase();
  }
  if (vehicleColor !== undefined) {
    update.vehicleColor = String(vehicleColor || '').trim();
  }
  if (vehicleMake !== undefined) {
    update.vehicleMake = String(vehicleMake || '').trim();
  }
  if (vehicleModel !== undefined) {
    update.vehicleModel = String(vehicleModel || '').trim();
  }
  if (vehicleImage !== undefined) {
    update.vehicleImage = String(vehicleImage || '').trim();
  }

  const driver = await Driver.findByIdAndUpdate(req.auth.sub, update, { new: true });

  if (!driver) {
    throw new ApiError(404, 'Driver not found');
  }

  res.json({
    success: true,
    data: {
      id: driver._id,
      name: driver.name,
      phone: driver.phone,
      vehicleType: driver.vehicleType,
      vehicleTypeId: driver.vehicleTypeId,
      vehicleIconType: driver.vehicleIconType,
      vehicleMake: driver.vehicleMake,
      vehicleModel: driver.vehicleModel,
      vehicleNumber: driver.vehicleNumber,
      vehicleColor: driver.vehicleColor,
      vehicleImage: driver.vehicleImage || '',
      registerFor: driver.registerFor,
      approve: driver.approve,
      status: driver.status,
      isOnline: driver.isOnline,
      isOnRide: driver.isOnRide,
    },
  });
};

export const getDriverApprovalStatus = async (req, res) => {
  const authorization = req.headers.authorization || '';
  const [, token] = authorization.split(' ');

  if (!token) {
    throw new ApiError(401, 'Authorization token is required');
  }

  const payload = verifyAccessToken(token);

  if (payload.role !== 'driver') {
    throw new ApiError(403, 'Insufficient permissions for this resource');
  }

  const driver = await Driver.findById(payload.sub);

  if (!driver) {
    throw new ApiError(404, 'Driver not found');
  }

  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  res.json({
    success: true,
    data: {
      id: driver._id,
      name: driver.name,
      phone: driver.phone,
      approve: driver.approve,
      status: driver.status,
      isOnline: driver.isOnline,
      isOnRide: driver.isOnRide,
    },
  });
};

export const getServiceLocations = async (_req, res) => {
  const results = await listDriverServiceLocations();

  res.json({
    success: true,
    data: { results },
  });
};

export const getDriverDocumentTemplates = async (_req, res) => {
  const results = await listDriverNeededDocuments({ activeOnly: true, includeFields: true });

  res.json({
    success: true,
    data: { results },
  });
};

export const startDriverLoginOtpRequest = async (req, res) => {
  const result = await startDriverLoginOtp(req.body);
  res.status(201).json({ success: true, data: result });
};

export const verifyDriverLoginOtpRequest = async (req, res) => {
  const result = await verifyDriverLoginOtp(req.body);
  res.json({ success: true, data: result });
};

export const startOnboarding = async (req, res) => {
  const result = await startDriverOnboarding(req.body);
  res.status(201).json({ success: true, data: result });
};

export const verifyOnboardingOtp = async (req, res) => {
  const result = await verifyDriverOtp(req.body);
  res.json({ success: true, data: result });
};

export const saveOnboardingPersonal = async (req, res) => {
  const result = await saveDriverPersonalDetails(req.body);
  res.json({ success: true, data: result });
};

export const saveOnboardingReferral = async (req, res) => {
  const result = await saveDriverReferral(req.body);
  res.json({ success: true, data: result });
};

export const saveOnboardingVehicle = async (req, res) => {
  const result = await saveDriverVehicle(req.body);
  res.json({ success: true, data: result });
};

export const saveOnboardingDocuments = async (req, res) => {
  const result = await saveDriverDocuments(req.body);
  res.json({ success: true, data: result });
};

export const completeOnboarding = async (req, res) => {
  const result = await completeDriverOnboarding(req.body);
  res.status(201).json({ success: true, data: result });
};

export const getOnboardingSession = async (req, res) => {
  const result = await getDriverOnboardingSession({ registrationId: req.params.registrationId, phone: req.query.phone });
  res.json({ success: true, data: result });
};

export const goOffline = async (req, res) => {
  const driver = await Driver.findByIdAndUpdate(
    req.auth.sub,
    {
      isOnline: false,
      socketId: null,
    },
    { new: true },
  );

  if (!driver) {
    throw new ApiError(404, 'Driver not found');
  }

  res.json({
    success: true,
    data: driver,
  });
};
