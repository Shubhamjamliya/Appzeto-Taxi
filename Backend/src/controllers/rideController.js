import { startDispatchFlow } from '../services/dispatchService.js';
import { createRideRecord, getRideDetails } from '../services/rideService.js';
import { ApiError } from '../utils/ApiError.js';
import { normalizePoint } from '../utils/geo.js';

export const createRide = async (req, res) => {
  const { pickup, drop, fare } = req.body;

  if (!pickup || !drop) {
    throw new ApiError(400, 'pickup and drop are required');
  }

  const ride = await createRideRecord({
    userId: req.auth.sub,
    pickupCoords: normalizePoint(pickup, 'pickup'),
    dropCoords: normalizePoint(drop, 'drop'),
    fare: Number(fare || 0),
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
