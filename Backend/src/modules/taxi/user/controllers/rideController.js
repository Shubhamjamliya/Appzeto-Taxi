import mongoose from 'mongoose';
import { ApiError } from '../../../../utils/ApiError.js';
import { normalizePoint } from '../../../../utils/geo.js';
import { Driver } from '../../driver/models/Driver.js';
import { createRideRecord, getRideDetails, startDispatchFlow } from '../services/rideService.js';

export const createRide = async (req, res) => {
  const { pickup, drop, fare, vehicleTypeId, vehicleIconType } = req.body;

  if (!pickup || !drop) {
    throw new ApiError(400, 'pickup and drop are required');
  }

  const ride = await createRideRecord({
    userId: req.auth.sub,
    pickupCoords: normalizePoint(pickup, 'pickup'),
    dropCoords: normalizePoint(drop, 'drop'),
    fare: Number(fare || 0),
    vehicleTypeId,
    vehicleIconType,
  });

  await startDispatchFlow(ride);

  res.status(201).json({
    success: true,
    data: ride,
  });
};

export const getRideById = async (req, res) => {
  const ride = await getRideDetails(req.params.rideId);

  res.json({
    success: true,
    data: ride,
  });
};

export const listAvailableDrivers = async (req, res) => {
  const { vehicleTypeId, lat, lng, maxDistance, limit = 30 } = req.query;
  const latitude = Number(lat);
  const longitude = Number(lng);
  const distance = Number(maxDistance);

  if (!vehicleTypeId) {
    throw new ApiError(400, 'vehicleTypeId is required');
  }

  if (!mongoose.Types.ObjectId.isValid(vehicleTypeId)) {
    throw new ApiError(400, 'vehicleTypeId is invalid');
  }

  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
    throw new ApiError(400, 'lat and lng are required');
  }

  const near = {
    $geometry: {
      type: 'Point',
      coordinates: [longitude, latitude],
    },
  };

  if (Number.isFinite(distance) && distance > 0) {
    near.$maxDistance = Math.min(distance, 25000);
  }

  const drivers = await Driver.find({
    isOnline: true,
    isOnRide: false,
    socketId: { $ne: null },
    vehicleTypeId,
    location: {
      $near: near,
    },
  })
    .limit(Math.min(Number(limit) || 30, 50))
    .select('name phone vehicleTypeId vehicleType vehicleIconType vehicleNumber vehicleColor vehicleMake vehicleModel rating location')
    .lean();

  res.json({
    success: true,
    data: {
      drivers: drivers.map((driver) => ({
        id: driver._id,
        name: driver.name,
        vehicleTypeId: driver.vehicleTypeId,
        vehicleType: driver.vehicleType,
        vehicleIconType: driver.vehicleIconType,
        vehicleNumber: driver.vehicleNumber,
        vehicleColor: driver.vehicleColor,
        vehicleMake: driver.vehicleMake,
        vehicleModel: driver.vehicleModel,
        rating: driver.rating,
        location: driver.location,
      })),
    },
  });
};
