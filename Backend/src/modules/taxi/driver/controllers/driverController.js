import { ApiError } from '../../../../utils/ApiError.js';
import { normalizePoint, toPoint } from '../../../../utils/geo.js';
import { Driver } from '../models/Driver.js';
import { comparePassword, hashPassword, signAccessToken } from '../services/authService.js';
import { findZoneByPickup } from '../services/locationService.js';
import { listDriverServiceLocations } from '../services/serviceLocationService.js';
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

export const getServiceLocations = async (_req, res) => {
  const results = await listDriverServiceLocations();

  res.json({
    success: true,
    data: { results },
  });
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
