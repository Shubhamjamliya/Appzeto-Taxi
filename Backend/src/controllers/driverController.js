import { Driver } from '../models/Driver.js';
import { findZoneByPickup } from '../services/matchingService.js';
import { comparePassword, hashPassword } from '../services/passwordService.js';
import { signAccessToken } from '../services/tokenService.js';
import { ApiError } from '../utils/ApiError.js';
import { normalizePoint, toPoint } from '../utils/geo.js';

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
